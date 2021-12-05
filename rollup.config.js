import typescript from "@rollup/plugin-typescript";

const defaults = {
  input: "index.ts",
  plugins: [typescript()],
};

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
];
