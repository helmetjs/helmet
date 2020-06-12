import { check } from "./helpers";
import xDownloadOptions from "../middlewares/x-download-options";

describe("X-Download-Options middleware", () => {
  it('sets "X-Download-Options: noopen"', async () => {
    await check(xDownloadOptions(), {
      "x-download-options": "noopen",
    });
  });
});
