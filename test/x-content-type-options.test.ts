import { check } from "./helpers";
import xContentTypeOptions from "../middlewares/x-content-type-options";

describe("X-Content-Type-Options middleware", () => {
  it('sets "X-Content-Type-Options: nosniff"', async () => {
    await check(xContentTypeOptions(), {
      "x-content-type-options": "nosniff",
    });
  });
});
