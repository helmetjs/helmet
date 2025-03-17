import { describe, it } from "node:test";
import xXssProtection from "../middlewares/x-xss-protection";
import { check } from "./helpers";

describe("X-XSS-Protection middleware", () => {
  it('sets "X-XSS-Protection: 0"', async () => {
    await check(xXssProtection(), {
      "x-xss-protection": "0",
    });
  });
});
