import { describe, it } from "node:test";
import xDownloadOptions from "../middlewares/x-download-options";
import { check } from "./helpers";

describe("X-Download-Options middleware", () => {
  it('sets "X-Download-Options: noopen"', async () => {
    await check(xDownloadOptions(), {
      "x-download-options": "noopen",
    });
  });
});
