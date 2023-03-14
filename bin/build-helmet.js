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
const esmDistPath = path.join(esmDistDir, "esm.js");
const esmTypesTempPath = path.join(esmDistDir, "tmp-esm-index.d.ts");
const esmTypesDistPath = path.join(esmDistDir, "esm.d.ts");
const commonJsDistDir = path.join(distPath, "cjs");
const commonJsDistPath = path.join(commonJsDistDir, "cjs.js");
const commonJsTypesTempPath = path.join(
  commonJsDistDir,
  "tmp-commonjs-index.d.ts"
);
const commonJsTypesDistPath = path.join(commonJsDistDir, "cjs.d.ts");

const compileEsm = () =>
  withEsmFile(esmSourcePath, async (esmTempPath) => {
    await fs.mkdir(esmDistDir, { recursive: true });
    await writeRollup(
      {
        input: esmTempPath,
        plugins: [rollupTypescript({ tsconfig: "./tsconfig-esm.json" })],
      },
      { file: esmDistPath }
    );
    await fs.rename(esmTypesTempPath, esmTypesDistPath);
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

    await fs.writeFile(
      path.join(commonJsDistDir, "package.json"),
      JSON.stringify({ type: "commonjs" })
    );

    await fs.rename(commonJsTypesTempPath, commonJsTypesDistPath);
  });

async function main() {
  await Promise.all([compileEsm(), compileCommonjs()]);
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
