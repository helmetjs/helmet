#!/usr/bin/env node
import * as path from "path";
import { fileURLToPath } from "url";
import rollupTypescript from "@rollup/plugin-typescript";
import {
  writeRollup,
  withCommonJsFile,
  withEsmFile,
  renameFile,
  finalizeCommonJs,
} from "./helpers.js";

const thisPath = fileURLToPath(import.meta.url);
const rootPath = path.join(path.dirname(thisPath), "..");
const esmSourcePath = path.join(rootPath, "index.ts");
const esmDistDir = path.join(rootPath, "dist", "esm");
const esmDistPath = path.join(esmDistDir, "index.js");
const commonJsDistDir = path.join(rootPath, "dist", "cjs");
const commonJsDistPath = path.join(commonJsDistDir, "index.js");

const compileEsm = () =>
  withEsmFile(esmSourcePath, (esmTempPath) =>
    writeRollup(
      {
        input: esmTempPath,
        plugins: [rollupTypescript({ tsconfig: "./tsconfig-esm.json" })],
      },
      { file: esmDistPath }
    ).then(() =>
      renameFile(
        path.join(esmDistDir, "tmp-esm-index.d.ts"),
        path.join(esmDistDir, "index.d.ts")
      )
    )
  );

const compileCommonjs = () =>
  withCommonJsFile(esmSourcePath, (commonJsTempPath) =>
    writeRollup(
      {
        input: commonJsTempPath,
        plugins: [rollupTypescript({ tsconfig: "./tsconfig-commonjs.json" })],
      },
      {
        exports: "named",
        file: commonJsDistPath,
        format: "cjs",
      }
    ).then(async () => await finalizeCommonJs(commonJsDistDir, esmDistDir))
  );

async function main() {
  await compileEsm();
  await compileCommonjs();
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
