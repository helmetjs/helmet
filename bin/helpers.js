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
  const startLineCjsFence = lines.findIndex((line) =>
    line.includes("!helmet-start-of-commonjs-exports")
  );
  const endLineCjsFence = lines.findIndex((line) =>
    line.includes("!helmet-end-of-commonjs-exports")
  );
  const lineCount = endLineCjsFence - startLineCjsFence + 2;
  lines.splice(startLineCjsFence, lineCount);

  const startLineEsmFence = lines.findIndex((line) =>
    line.includes("!helmet-start-of-esm-exports")
  );
  lines.splice(startLineEsmFence, 1);

  const endLineEsmFence = lines.findIndex((line) =>
    line.includes("!helmet-end-of-esm-exports")
  );
  lines.splice(endLineEsmFence, 1);

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
  const resultLines = lines.slice(0, endLine - 1);

  try {
    await fs.writeFile(commonJsTempPath, resultLines.join("\n"));

    await fn(commonJsTempPath);
  } finally {
    await fs.unlink(commonJsTempPath);
  }
}
