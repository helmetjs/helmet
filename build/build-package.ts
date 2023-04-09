import * as path from "path";
import * as os from "os";
import * as fsOriginal from "fs";
import * as zlib from "zlib";
import { fileURLToPath } from "url";
import { pipeline } from "stream";
import { promisify } from "util";
import { RollupBuild, rollup } from "rollup";
import rollupTypescript from "@rollup/plugin-typescript";
import rollupDts from "rollup-plugin-dts";
import prettier from "prettier";
import zopfli from "node-zopfli";
import { npm } from "./helpers.js";

const fs = fsOriginal.promises;
const pipe = promisify(pipeline);

// This shaves a few bytes off the built files while still keeping them readable.
// When testing on 4f550aab7ccf00a6dfe686d57195268b3ef06b1a, it reduces the tarball size by about 100 bytes.
// This should help installation performance slightly.
const PRETTIER_PREPACK_CRUSH_OPTIONS: prettier.Options = {
  printWidth: 2000,
  trailingComma: "none",
  useTabs: true,
  arrowParens: "avoid",
  bracketSpacing: false,
  semi: false,
};

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const testFiles = path.join(rootDir, "test", "**");

/**
 * Build a Helmet package into a tarball ready to be published with `npm publish`.
 */
export async function buildAndPack(
  middlewareToBuild?: string
): Promise<string> {
  let entry: string;
  let esm: boolean;
  let packageOverrides: Record<string, unknown>;
  let filesToCopy: readonly string[];

  if (middlewareToBuild) {
    const middlewareDir = path.join(rootDir, "middlewares", middlewareToBuild);
    entry = path.join(middlewareDir, "index.ts");
    esm = false;
    packageOverrides = await readJson(
      path.join(middlewareDir, "package-overrides.json")
    );
    filesToCopy = [
      path.join(rootDir, "LICENSE"),
      path.join(middlewareDir, "README.md"),
      path.join(middlewareDir, "CHANGELOG.md"),
    ];
  } else {
    entry = path.join(rootDir, "index.ts");
    esm = true;
    packageOverrides = {};
    filesToCopy = [
      path.join(rootDir, "LICENSE"),
      path.join(rootDir, "README.md"),
      path.join(rootDir, "CHANGELOG.md"),
      path.join(rootDir, "SECURITY.md"),
    ];
  }

  const distDir = await temporaryDirectory();

  await Promise.all([
    buildCjs({ entry, distDir }),
    ...(esm ? [buildMjs({ entry, distDir })] : []),
    buildTypes({ entry, distDir }),
    buildPackageJson({ esm, packageOverrides, distDir }),
    copyStaticFiles({ filesToCopy, distDir }),
  ]);

  await prePackCrush(distDir);

  const npmPackedTarball = await pack(distDir);

  const crushedTarball = await postPackCrush(npmPackedTarball);

  return crushedTarball;
}

function temporaryDirectory(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "helmet"));
}

async function buildCjs({
  entry,
  distDir,
}: Readonly<{ entry: string; distDir: string }>) {
  const outputPath = path.join(distDir, "index.cjs");

  console.log(`Building ${outputPath}...`);

  const bundle = await rollupForJs(entry);

  await bundle.write({
    file: outputPath,
    exports: "named",
    format: "cjs",
    generatedCode: "es2015",
    outro: "module.exports = exports.default;",
  });

  await bundle.close();

  console.log(`Built ${outputPath}.`);
}

async function buildMjs({
  entry,
  distDir,
}: Readonly<{ entry: string; distDir: string }>) {
  const outputPath = path.join(distDir, "index.mjs");

  console.log(`Building ${outputPath}...`);

  const bundle = await rollupForJs(entry);

  await bundle.write({
    file: outputPath,
    format: "esm",
    generatedCode: "es2015",
  });

  await bundle.close();

  console.log(`Built ${outputPath}.`);
}

function rollupForJs(entry: string): Promise<RollupBuild> {
  return rollup({
    input: entry,
    plugins: [
      rollupTypescript({
        exclude: [testFiles],
      }),
    ],
  });
}

async function buildTypes({
  entry,
  distDir,
}: Readonly<{ entry: string; distDir: string }>) {
  const outputPath = path.join(distDir, "index.d.ts");

  console.log(`Building ${outputPath}...`);

  const bundle = await rollup({
    input: entry,
    external: ["http"],
    plugins: [rollupDts()],
  });

  await bundle.write({
    file: outputPath,
    format: "esm",
  });

  await bundle.close();

  console.log(`Built ${outputPath}.`);
}

async function buildPackageJson({
  esm,
  packageOverrides,
  distDir,
}: Readonly<{
  esm: boolean;
  packageOverrides: Readonly<Record<string, unknown>>;
  distDir: string;
}>) {
  const outputPath = path.join(distDir, "package.json");

  console.log(`Building ${outputPath}...`);

  const devPackageJson = await readJson(path.join(rootDir, "package.json"));

  const packageJson = {
    name: "helmet",
    description: "help secure Express/Connect apps with various HTTP headers",
    version: devPackageJson.version,
    author: "Adam Baldwin <adam@npmjs.com> (https://evilpacket.net)",
    contributors: ["Evan Hahn <me@evanhahn.com> (https://evanhahn.com)"],
    homepage: "https://helmetjs.github.io/",
    bugs: {
      url: "https://github.com/helmetjs/helmet/issues",
      email: "me@evanhahn.com",
    },
    repository: {
      type: "git",
      url: "git://github.com/helmetjs/helmet.git",
    },
    license: "MIT",
    keywords: ["express", "security", "headers", "backend"],

    engines: {
      node: ">=14.0.0",
    },

    exports: {
      ".": {
        ...(esm
          ? {
              import: {
                types: "./index.d.ts",
                default: "./index.mjs",
              },
            }
          : {}),
        require: {
          types: "./index.d.ts",
          default: "./index.cjs",
        },
      },
    },
    // All supported versions of Node handle `exports`, but some build tools
    // still use `main`, so we keep it around.
    main: "./index.cjs",

    ...packageOverrides,
  };

  await fs.writeFile(outputPath, JSON.stringify(packageJson));

  console.log(`Built ${outputPath}.`);
}

async function readJson(path: fsOriginal.PathLike): Promise<any> {
  return JSON.parse(await fs.readFile(path, "utf8"));
}

async function copyStaticFiles({
  filesToCopy,
  distDir,
}: Readonly<{ filesToCopy: readonly string[]; distDir: string }>) {
  await Promise.all(
    filesToCopy.map(async (source) => {
      const basename = path.basename(source);
      const dest = path.join(distDir, basename);
      console.log(`Copying ${source} to ${dest}...`);
      await fs.copyFile(source, dest);
      console.log(`Copied ${source} to ${dest}.`);
    })
  );
}

async function prePackCrush(distDir: string): Promise<void> {
  const files = (await fs.readdir(distDir))
    .map((file) => path.join(distDir, file))
    .filter((file) => path.extname(file) !== ".md");

  await Promise.all(
    files.map(async (file) => {
      const prettierInfo = await prettier.getFileInfo(file);
      if (!prettierInfo.inferredParser) {
        return;
      }

      console.log(`Crushing ${file}...`);

      const oldContents = await fs.readFile(file, { encoding: "utf8" });

      const newContents = await prettier.format(oldContents, {
        filepath: file,
        ...PRETTIER_PREPACK_CRUSH_OPTIONS,
      });

      await fs.writeFile(file, newContents, { encoding: "utf8" });

      console.log(`Crushed ${file}.`);
    })
  );
}

async function pack(distDir: string): Promise<string> {
  await npm(["pack"], { cwd: distDir });

  const tempDirFiles = await fs.readdir(distDir);
  const tarballName = tempDirFiles.find(
    (file) => file.startsWith("helmet-") && file.endsWith(".tgz")
  );
  if (!tarballName) {
    throw new Error(
      "Couldn't find helmet tarball in temp directory. Build is not set up correctly"
    );
  }

  return path.join(distDir, tarballName);
}

async function postPackCrush(originalTarGz: string): Promise<string> {
  const originalSize = (await fs.stat(originalTarGz)).size;
  console.log(`Crushing ${originalTarGz} (size: ${originalSize})...`);

  const crushedTarGz = originalTarGz.replace(".tgz", ".crushed.tgz");
  const readOriginal = fsOriginal.createReadStream(originalTarGz);
  const gunzip = zlib.createGunzip();
  const gzip = zopfli.createGzip({ numiterations: 15 });
  const writeCrushed = fsOriginal.createWriteStream(crushedTarGz);

  await pipe(readOriginal, gunzip, gzip, writeCrushed);

  const crushedSize = (await fs.stat(crushedTarGz)).size;
  const savings = originalSize - crushedSize;

  if (savings < 0) {
    console.log("Original tarball was smaller");
    return originalTarGz;
  } else {
    const ratio = crushedSize / originalSize;
    console.log(
      `Crushed into ${crushedTarGz}. Size: ${crushedSize}. Savings: ${savings} bytes (result is ${Math.round(
        ratio * 100
      )}% the size)`
    );
    return crushedTarGz;
  }
}

const isMain =
  import.meta.url.startsWith("file:") &&
  process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  if (process.argv.length > 3) {
    throw new Error("Too many arguments");
  }

  const middlewareToBuild = process.argv[2];
  buildAndPack(middlewareToBuild)
    .then((finalTarballPath) => {
      console.log(finalTarballPath);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
