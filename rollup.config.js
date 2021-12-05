import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: "index.ts",
    output: {
      exports: "named",
      file: "dist/index.cjs",
      format: "cjs",
    },
    plugins: [typescript()],
  },
  {
    input: "index.ts",
    output: { file: "dist/index.js", },
    plugins: [typescript({ tsconfig: './tsconfig-types.json' })],
  },
];
