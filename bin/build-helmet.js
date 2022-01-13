#!/usr/bin/env node
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import rollupTypescript from "@rollup/plugin-typescript";
import {
  writeRollup,
  withCommonJsFile,
  withEsmFile,
  renameFile,
  finalizeCommonJs,
  moveDir
} from "./helpers.js";

const thisPath = fileURLToPath(import.meta.url);
const rootPath = path.join(path.dirname(thisPath), "..");
const distPath = path.join(rootPath, "dist");
const esmSourcePath = path.join(rootPath, "index.ts");
const esmDistDir = path.join(distPath, "esm");
const esmDistPath = path.join(esmDistDir, "index.js");
const commonJsDistDir = path.join(distPath, "cjs");
const commonJsDistPath = path.join(commonJsDistDir, "index.js");
const typesDistDir = path.join(distPath, "types");

const compileEsm = () =>
  withEsmFile(esmSourcePath, (esmTempPath) =>
    writeRollup(
      {
        input: esmTempPath,
        plugins: [rollupTypescript({ tsconfig: "./tsconfig-esm.json" })],
      },
      { file: esmDistPath }
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

const finalizeTypes = async () => {
  await fs.mkdir(typesDistDir);
  await fs.mkdir(path.join(typesDistDir, "middlewares"));
  await renameFile(
    path.join(esmDistDir, "tmp-esm-index.d.ts"),
    path.join(distPath, "types", "index.d.ts")
  );
  await moveDir(path.join(esmDistDir, "middlewares"), path.join(typesDistDir, "middlewares"))
  await fs.rmdir(path.join(esmDistDir, "middlewares"));
}

async function main() {
  await compileEsm();
  await compileCommonjs();
  await finalizeTypes();
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
