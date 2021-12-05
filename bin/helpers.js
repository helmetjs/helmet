import * as path from "path";
import { promises as fs } from "fs";
import { rollup } from "rollup";

export async function writeRollup(inputOptions, outputOptions) {
  const bundle = await rollup(inputOptions);
  await bundle.write(outputOptions);
  await bundle.close();
}

export async function withCommonJsFile(esmSourcePath, fn) {
  const commonJsSourcePath = path.join(
    path.dirname(esmSourcePath),
    "tmp-commonjs-index.ts"
  );

  const lines = (await fs.readFile(esmSourcePath, "utf8")).split(/\r?\n/);
  const resultLines = lines.slice(
    0,
    lines.findIndex((line) => line.includes("!helmet-end-of-commonjs"))
  );

  try {
    await fs.writeFile(commonJsSourcePath, resultLines.join("\n"));

    await fn(commonJsSourcePath);
  } finally {
    await fs.unlink(commonJsSourcePath);
  }
}
