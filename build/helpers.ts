import * as childProcess from "child_process";

export const npm = (
  args: ReadonlyArray<string>,
  { cwd }: Readonly<{ cwd: string }>
): Promise<void> =>
  new Promise((resolve, reject) => {
    const proc = childProcess.spawn("npm", args, {
      cwd,
      stdio: ["inherit", "ignore", "inherit"],
    });
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`npm ${args.join(" ")} exited with code ${code}`));
      }
    });
  });
