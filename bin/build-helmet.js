#!/usr/bin/env node
import * as path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import rollupTypescript from "@rollup/plugin-typescript";
import { writeRollup } from "./helpers.js";

const thisPath = fileURLToPath(import.meta.url);
const rootPath = path.join(path.dirname(thisPath), "..");
const esmSourcePath = path.join(rootPath, "index.ts");
const esmDistPath = path.join(rootPath, "dist", "index.js");
const commonJsSourcePath = path.join(rootPath, "tmp-commonjs-index.ts");
const commonJsDistPath = path.join(rootPath, "dist", "index.cjs");

async function compileEsm() {
  await writeRollup(
    {
      input: esmSourcePath,
      plugins: [rollupTypescript({ tsconfig: "./tsconfig-esm.json" })],
    },
    { file: esmDistPath }
  );
}

async function compileCommonjs() {
  const lines = (await fs.readFile(esmSourcePath, "utf8")).split(/\r?\n/);
  const resultLines = lines.slice(
    0,
    lines.findIndex((line) => line.includes("!helmet-end-of-commonjs"))
  );

  try {
    await fs.writeFile(commonJsSourcePath, resultLines.join("\n"));
    await writeRollup(
      {
        input: commonJsSourcePath,
        plugins: [rollupTypescript({ tsconfig: "./tsconfig-commonjs.json" })],
      },
      {
        exports: "default",
        file: commonJsDistPath,
        format: "cjs",
      }
    );
  } finally {
    await fs.unlink(commonJsSourcePath);
  }
}

async function main() {
  await compileEsm();
  await compileCommonjs();
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
