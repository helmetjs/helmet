import * as path from "path";
import { promises as fs } from "fs";
import { rollup } from "rollup";

export async function writeRollup(inputOptions, outputOptions) {
  const bundle = await rollup(inputOptions);
  await bundle.write(outputOptions);
  await bundle.close();
}

export async function withEsmFile(esmSourcePath, fn) {
  const esmTempPath = path.join(
    path.dirname(esmSourcePath),
    "tmp-esm-index.ts"
  );

  const lines = (await fs.readFile(esmSourcePath, "utf8")).split(/\r?\n/);
  const startLine = lines.findIndex((line) =>
    line.includes("!helmet-start-of-commonjs-exports")
  );
  const endLine = lines.findIndex((line) =>
    line.includes("!helmet-end-of-commonjs-exports")
  );
  const lineCount = endLine - startLine + 1;
  lines.splice(startLine, lineCount);

  try {
    await fs.writeFile(esmTempPath, lines.join("\n"));

    await fn(esmTempPath);
  } finally {
    await fs.unlink(esmTempPath);
  }
}

export async function withCommonJsFile(esmSourcePath, fn) {
  const commonJsTempPath = path.join(
    path.dirname(esmSourcePath),
    "tmp-commonjs-index.ts"
  );

  const lines = (await fs.readFile(esmSourcePath, "utf8")).split(/\r?\n/);
  const startLine = lines.findIndex((line) =>
    line.includes("!helmet-start-of-commonjs-exports")
  );
  const endLine = lines.findIndex((line) =>
    line.includes("!helmet-end-of-commonjs-exports")
  );
  lines.splice(startLine, 1);
  const resultLines = lines.slice(0, endLine);

  try {
    await fs.writeFile(commonJsTempPath, resultLines.join("\n"));

    await fn(commonJsTempPath);
  } finally {
    await fs.unlink(commonJsTempPath);
  }
}

export function renameFile(oldPath, newPath) {
  fs.rename(oldPath, newPath),
    (error) => {
      if (error) console.error(error);
    };
}

export async function finalizeCommonJs(commonJsDistDir, esmDistDir) {
  const cjsPackageJson = JSON.stringify({
    type: "commonjs",
  });

  await fs.writeFile(
    path.join(commonJsDistDir, "package.json"),
    cjsPackageJson
  );
  await fs.copyFile(
    path.join(esmDistDir, "index.d.ts"),
    path.join(commonJsDistDir, "index.d.ts")
  );
}
