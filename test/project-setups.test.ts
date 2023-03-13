import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";
import { promisify } from "util";

const exec = promisify(childProcess.exec);

describe("project setups", () => {
  const projectSetupsFolder = path.join(__dirname, "project-setups");
  const projectSetups = fs
    .readdirSync(projectSetupsFolder, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  beforeAll(async () => {
    // TODO: Improve the error message
    const distPath = path.join(__dirname, "..", 'dist');
    await fs.promises.stat(distPath)
  });

  it.each(projectSetups)("%s style", async (projectSetupName) => {
    const projectFolder = path.join(projectSetupsFolder, projectSetupName);
    await exec("npm run helmet:test", { cwd: projectFolder });
  });
});
