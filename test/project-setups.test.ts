import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";
import { promisify } from "util";
import { npm } from "../build/helpers.js";

const exec = promisify(childProcess.exec);

describe("project setups", () => {
  const projectSetupsFolder = path.join(__dirname, "project-setups");
  const projectSetups = fs
    .readdirSync(projectSetupsFolder, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  let helmetTarball: string;

  jest.setTimeout(60_000);
  beforeAll(async () => {
    // Unfortunately, we can't import `buildAndPack` directly.
    // Run it and get the last line: the tarball path.
    const { stdout } = await exec("npm run build");
    const lines = stdout.trim().split(/\r?\n/g);
    const lastLine = lines[lines.length - 1]?.trim();
    if (!lastLine) {
      throw new Error("Couldn't parse tarball path from build output");
    }
    helmetTarball = lastLine;
  });

  it.each(projectSetups)("%s style", async (projectSetupName) => {
    const projectFolder = path.join(projectSetupsFolder, projectSetupName);
    const nodeModulesFolder = path.join(projectFolder, "node_modules");
    await fs.promises.rm(nodeModulesFolder, { recursive: true, force: true });
    await npm(["install", "--no-save", "--no-audit", helmetTarball], {
      cwd: projectFolder,
    });
    await npm(["run", "helmet:test"], { cwd: projectFolder });
  });
});
