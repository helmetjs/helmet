import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import typescript from "@rollup/plugin-typescript";

const defaults = {
  input: "index.ts",
  plugins: [typescript()],
};

const thisPath = fileURLToPath(import.meta.url);
const middlewaresPath = path.join(path.dirname(thisPath), "middlewares");
const middlewares = fs.readdirSync(middlewaresPath);

export default [
  {
    ...defaults,
    output: {
      exports: "named",
      file: "dist/index.cjs",
      format: "cjs",
    },
  },
  {
    ...defaults,
    output: {
      file: "dist/index.js",
    },
  },
  ...middlewares.map((middleware) => ({
    ...defaults,
    input: path.join(middlewaresPath, middleware, "index.ts"),
    output: {
      exports: "named",
      dir: `dist/middlewares/${middleware}`,
      format: "cjs",
    },
  })),
];
