#!/usr/bin/env node
const path = require("path");
const fs = require("fs").promises;
const os = require("os");
const crypto = require("crypto");

const PROJECT_ROOT_PATH = path.join(__dirname, "..");
const getRootFilePath = (filename) => path.join(PROJECT_ROOT_PATH, filename);

async function main(argv) {
  if (argv.length !== 3) {
    throw new Error("Incorrect number of arguments");
  }

  const stagingDirectoryPath = path.join(
    os.tmpdir(),
    `helmet-middleware-release-${argv[2]}-${crypto
      .randomBytes(8)
      .toString("hex")}`
  );

  const getSourceFilePath = (filename) =>
    path.join(PROJECT_ROOT_PATH, "middlewares", argv[2], filename);
  const getDistFilePath = (filename) =>
    path.join(PROJECT_ROOT_PATH, "dist", "middlewares", argv[2], filename);
  const getStagingFilePath = (filename) =>
    path.join(stagingDirectoryPath, filename);

  const packageFiles = require(getSourceFilePath("package-files.json"));

  const packageJson = {
    author: "Adam Baldwin <adam@npmjs.com> (https://evilpacket.net)",
    contributors: ["Evan Hahn <me@evanhahn.com> (https://evanhahn.com)"],
    license: "MIT",
    homepage: "https://helmetjs.github.io/",
    bugs: {
      url: "https://github.com/helmetjs/helmet/issues",
      email: "me@evanhahn.com",
    },
    repository: {
      type: "git",
      url: "git://github.com/helmetjs/helmet.git",
    },
    engines: {
      node: ">=10.0.0",
    },
    files: ["CHANGELOG.md", "LICENSE", "README.md", ...packageFiles],
    main: "index.js",
    typings: "index.d.ts",
    ...require(getSourceFilePath("package-overrides.json")),
  };

  await fs.mkdir(stagingDirectoryPath, { recursive: true, mode: 0o700 });
  await Promise.all([
    fs.writeFile(
      getStagingFilePath("package.json"),
      JSON.stringify(packageJson)
    ),
    fs.copyFile(
      getSourceFilePath("README.md"),
      getStagingFilePath("README.md")
    ),
    fs.copyFile(
      getSourceFilePath("CHANGELOG.md"),
      getStagingFilePath("CHANGELOG.md")
    ),
    fs.copyFile(getRootFilePath("LICENSE"), getStagingFilePath("LICENSE")),
    ...packageFiles.map((filename) =>
      fs.copyFile(getDistFilePath(filename), getStagingFilePath(filename))
    ),
  ]);

  console.log(
    `Staged ${packageJson.name}@${packageJson.version} in ${stagingDirectoryPath}`
  );
}

main(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
