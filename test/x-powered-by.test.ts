import { describe, it } from "node:test";
import xPoweredBy from "../middlewares/x-powered-by";
import { check } from "./helpers";

describe("X-Powered-By middleware", () => {
  it("does nothing if the request was not set earlier in the stack", async () => {
    await check(xPoweredBy(), {
      "x-powered-by": null,
    });
  });

  it("removes the header if it was set earlier in the stack", async () => {
    await check(
      (req, res, next) => {
        res.setHeader("X-POWERED-BY", "should be destroyed");
        xPoweredBy()(req, res, next);
      },
      {
        "x-powered-by": null,
      },
    );
  });
});
