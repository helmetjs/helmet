#!/usr/bin/env node
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import rollupTypescript from "@rollup/plugin-typescript";
import { withCommonJsFile, withEsmFile, writeRollup } from "./helpers.js";

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
  withEsmFile(esmSourcePath, async (esmTempPath) => {
    await writeRollup(
      {
        input: esmTempPath,
        plugins: [rollupTypescript({ tsconfig: "./tsconfig-esm.json" })],
      },
      { file: path.join(distPath, "index.js") }
    );

    await fs.mkdir(esmDistDir);
    await fs.rename(path.join(distPath, "index.js"), esmDistPath);
    await fs.rename(
      path.join(typesDistDir, "tmp-esm-index.d.ts"),
      path.join(typesDistDir, "index.d.ts")
    );
  });

const compileCommonjs = () =>
  withCommonJsFile(esmSourcePath, async (commonJsTempPath) => {
    await writeRollup(
      {
        input: commonJsTempPath,
        plugins: [rollupTypescript({ tsconfig: "./tsconfig-commonjs.json" })],
      },
      {
        exports: "named",
        file: commonJsDistPath,
        format: "cjs",
      }
    );

    const cjsPackageJson = JSON.stringify({
      type: "commonjs",
    });

    await fs.writeFile(
      path.join(commonJsDistDir, "package.json"),
      cjsPackageJson
    );
  });

async function main() {
  await compileEsm();
  await compileCommonjs();
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
