import * as childProcess from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { npm } from "../build/helpers.js";

const exec = promisify(childProcess.exec);

const projectSetupsFolder = fileURLToPath(
  new URL("./project-setups", import.meta.url),
);
const projectSetups = fs
  .readdirSync(projectSetupsFolder, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

async function buildHelmet(): Promise<string> {
  // Unfortunately, we can't import `buildAndPack` directly.
  // Run it and get the last line: the tarball path.
  const { stdout } = await exec("npm run build");
  const lines = stdout.trim().split(/\r?\n/g);
  const result = lines[lines.length - 1]?.trim();
  if (!result) {
    throw new Error("Couldn't parse tarball path from build output");
  }
  return result;
}

let helmetTarballPromise: undefined | Promise<string>;
async function getHelmetTarballPath(): Promise<string> {
  if (!helmetTarballPromise) {
    helmetTarballPromise = buildHelmet();
  }
  return helmetTarballPromise;
}

for (const projectSetupName of projectSetups) {
  test(`${projectSetupName} project setup`, { timeout: 60_000 }, async () => {
    const projectFolder = path.join(projectSetupsFolder, projectSetupName);
    const nodeModulesFolder = path.join(projectFolder, "node_modules");

    await fs.promises.rm(nodeModulesFolder, { recursive: true, force: true });

    await npm(
      ["install", "--no-save", "--no-audit", await getHelmetTarballPath()],
      {
        cwd: projectFolder,
      },
    );

    await npm(["run", "helmet:test"], { cwd: projectFolder });
  });
}
