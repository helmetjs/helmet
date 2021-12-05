#!/usr/bin/env node
import * as path from "path";
import { promises as fs } from "fs";
import * as os from "os";
import * as crypto from "crypto";
import { fileURLToPath } from "url";
import rollupTypescript from "@rollup/plugin-typescript";
import { writeRollup, withCommonJsFile } from "./helpers.js";

const thisPath = fileURLToPath(import.meta.url);
const rootPath = path.join(path.dirname(thisPath), "..");
const getRootFilePath = (filename) => path.join(rootPath, filename);

const readJson = async (path) => JSON.parse(await fs.readFile(path));

async function main(argv) {
  if (argv.length !== 3) {
    throw new Error("Incorrect number of arguments");
  }

  const stagingDirectoryPath = path.join(
    os.tmpdir(),
    `helmet-middleware-release-${argv[2]}-${crypto
      .randomBytes(8)
      .toString("hex")}`
  );

  const getSourceFilePath = (filename) =>
    path.join(rootPath, "middlewares", argv[2], filename);
  const getDistFilePath = (filename) =>
    path.join(rootPath, "dist", "middlewares", argv[2], filename);
  const getStagingFilePath = (filename) =>
    path.join(stagingDirectoryPath, filename);

  const packageJson = {
    author: "Adam Baldwin <adam@npmjs.com> (https://evilpacket.net)",
    contributors: ["Evan Hahn <me@evanhahn.com> (https://evanhahn.com)"],
    license: "MIT",
    homepage: "https://helmetjs.github.io/",
    bugs: {
      url: "https://github.com/helmetjs/helmet/issues",
      email: "me@evanhahn.com",
    },
    repository: {
      type: "git",
      url: "git://github.com/helmetjs/helmet.git",
    },
    engines: {
      node: ">=12.0.0",
    },
    files: ["CHANGELOG.md", "LICENSE", "README.md", "index.js", "index.d.ts"],
    main: "index.js",
    typings: "index.d.ts",
    exports: {
      ".": {
        require: "./index.js",
        types: "./index.d.ts",
      },
    },
    ...(await readJson(getSourceFilePath("package-overrides.json"))),
  };

  await fs.mkdir(stagingDirectoryPath, { recursive: true, mode: 0o700 });
  await Promise.all([
    withCommonJsFile(getSourceFilePath("index.ts"), (commonJsSourcePath) =>
      writeRollup(
        {
          input: commonJsSourcePath,
          plugins: [rollupTypescript()],
        },
        {
          exports: "default",
          file: getStagingFilePath("index.js"),
          format: "cjs",
        }
      )
    ),
    fs.writeFile(
      getStagingFilePath("package.json"),
      JSON.stringify(packageJson)
    ),
    fs.copyFile(
      getSourceFilePath("README.md"),
      getStagingFilePath("README.md")
    ),
    fs.copyFile(
      getSourceFilePath("CHANGELOG.md"),
      getStagingFilePath("CHANGELOG.md")
    ),
    fs.copyFile(getRootFilePath("LICENSE"), getStagingFilePath("LICENSE")),
    fs.copyFile(
      getDistFilePath("index.d.ts"),
      getStagingFilePath("index.d.ts")
    ),
  ]);

  console.log(
    `Staged ${packageJson.name}@${packageJson.version} in ${stagingDirectoryPath}`
  );
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
