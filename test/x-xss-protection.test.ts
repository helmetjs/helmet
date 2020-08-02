import { check } from "./helpers";
import xXssProtection from "../middlewares/x-xss-protection";

describe("X-XSS-Protection middleware", () => {
  it('sets "X-XSS-Protection: 0"', async () => {
    await check(xXssProtection(), {
      "x-xss-protection": "0",
    });
  });
});
