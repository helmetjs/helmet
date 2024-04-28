import { promisify } from "node:util";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as childProcess from "node:child_process";
import { ReadableStream } from "node:stream/web";

const EXTNAMES_THAT_DONT_HAVE_TO_BE_ASCII: ReadonlySet<string> = new Set([
  ".md",
]);
const NEWLINE = "\n".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
const TILDE = "~".charCodeAt(0);

const exec = promisify(childProcess.exec);
const root = path.resolve(__dirname, "..");

describe("source files", () => {
  it('only has "normal" ASCII characters in the source files', async () => {
    for await (const { sourceFile, chunk, index } of getSourceFileChunks()) {
      const abnormalByte = chunk.find((byte) => !isNormalAsciiByte(byte));
      if (typeof abnormalByte === "number") {
        throw new Error(
          `${sourceFile} must only contain "normal" ASCII characters but contained 0x${abnormalByte.toString(16)} at index ${index + chunk.indexOf(abnormalByte)}`,
        );
      }
    }
  });
});

const getSourceFileChunks = (): AsyncIterable<{
  sourceFile: string;
  chunk: Uint8Array;
  index: number;
}> =>
  new ReadableStream({
    async start(controller) {
      await Promise.all(
        (await getSourceFiles()).map(async (sourceFile) => {
          const handle = await fs.open(sourceFile);
          let index = 0;
          for await (const chunk of handle.readableWebStream({
            type: "bytes",
          })) {
            controller.enqueue({ sourceFile, chunk, index });
            index += chunk.byteLength;
          }
          await handle.close();
        }),
      );
      controller.close();
    },
  });

const getSourceFiles = async (): Promise<Array<string>> =>
  (await exec("git ls-files", { cwd: root, env: {} })).stdout
    .split(/\r?\n/g)
    .filter(
      (file) => !EXTNAMES_THAT_DONT_HAVE_TO_BE_ASCII.has(path.extname(file)),
    )
    .filter(Boolean)
    .map((line) => path.resolve(root, line));

const isNormalAsciiByte = (byte: number): boolean =>
  byte === NEWLINE || (byte >= SPACE && byte <= TILDE);
