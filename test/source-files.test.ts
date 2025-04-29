import * as childProcess from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const EXTNAMES_THAT_DONT_HAVE_TO_BE_ASCII: ReadonlySet<string> = new Set([
  ".md",
]);
const NEWLINE = "\n".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
const TILDE = "~".charCodeAt(0);

const exec = promisify(childProcess.exec);

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), "..");

describe("source files", () => {
  it('only has "normal" ASCII characters in the source files', async () => {
    const sourceFiles = await getSourceFiles();
    for (const { path, contents } of sourceFiles) {
      const abnormalByteIndex = contents.findIndex(
        (byte) => !isNormalAsciiByte(byte),
      );
      if (abnormalByteIndex !== -1) {
        throw new Error(
          `${path} must only contain "normal" ASCII characters but contained abnormal byte at ${abnormalByteIndex}`,
        );
      }
    }
  });
});

const getSourceFiles = async (): Promise<
  Iterable<{ path: string; contents: Uint8Array }>
> => {
  const paths = await getSourceFilePaths();
  return Promise.all(
    paths.map(async (path) => ({
      path,
      contents: await fs.readFile(path),
    })),
  );
};

const getSourceFilePaths = async (): Promise<Array<string>> =>
  (await exec("git ls-files", { cwd: root })).stdout
    .split(/\r?\n/g)
    .filter(
      (file) => !EXTNAMES_THAT_DONT_HAVE_TO_BE_ASCII.has(path.extname(file)),
    )
    .filter(Boolean)
    .map((line) => path.resolve(root, line));

const isNormalAsciiByte = (byte: number): boolean =>
  byte === NEWLINE || (byte >= SPACE && byte <= TILDE);
