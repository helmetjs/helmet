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

export async function renameFile(oldPath, newPath) {
  await fs.rename(oldPath, newPath)
    .catch((error) => {
      if (error) console.error(error);
    });
}

export async function finalizeCommonJs(commonJsDistDir) {
  const cjsPackageJson = JSON.stringify({
    type: "commonjs",
  });

  await fs.writeFile(
    path.join(commonJsDistDir, "package.json"),
    cjsPackageJson
  );
}

export async function moveDir(oldPath, newPath) {
  await fs.mkdir(newPath, { recursive: true });
  let entries = await fs.readdir(oldPath, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(oldPath, entry.name);
    let destPath = path.join(newPath, entry.name);

    entry.isDirectory() ?
      (await moveDir(srcPath, destPath), await fs.rmdir(srcPath)) :
      (await fs.copyFile(srcPath, destPath), await fs.rm(srcPath));
  }
}
