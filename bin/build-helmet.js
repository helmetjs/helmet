#!/usr/bin/env node
import * as path from "path";
import { fileURLToPath } from "url";
import rollupTypescript from "@rollup/plugin-typescript";
import { writeRollup, withCommonJsFile } from "./helpers.js";

const thisPath = fileURLToPath(import.meta.url);
const rootPath = path.join(path.dirname(thisPath), "..");
const esmSourcePath = path.join(rootPath, "index.ts");
const esmDistPath = path.join(rootPath, "dist", "index.js");
const commonJsDistPath = path.join(rootPath, "dist", "index.cjs");

const compileEsm = () =>
  writeRollup(
    {
      input: esmSourcePath,
      plugins: [rollupTypescript({ tsconfig: "./tsconfig-esm.json" })],
    },
    { file: esmDistPath }
  );

const compileCommonjs = () =>
  withCommonJsFile(esmSourcePath, (commonJsSourcePath) =>
    writeRollup(
      {
        input: commonJsSourcePath,
        plugins: [rollupTypescript({ tsconfig: "./tsconfig-commonjs.json" })],
      },
      {
        exports: "default",
        file: commonJsDistPath,
        format: "cjs",
      }
    )
  );

async function main() {
  await compileEsm();
  await compileCommonjs();
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
