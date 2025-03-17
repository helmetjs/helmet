import assert from "node:assert/strict";
import { describe, it } from "node:test";
import crossOriginOpenerPolicy from "../middlewares/cross-origin-opener-policy";
import { check } from "./helpers";

describe("Cross-Origin-Opener-Policy middleware", () => {
  it('sets "Cross-Origin-Opener-Policy: same-origin" when called with no policy', async () => {
    const expectedHeaders = {
      "cross-origin-opener-policy": "same-origin",
    };
    await check(crossOriginOpenerPolicy(), expectedHeaders);
    await check(crossOriginOpenerPolicy({}), expectedHeaders);
    await check(crossOriginOpenerPolicy(Object.create(null)), expectedHeaders);
    await check(
      crossOriginOpenerPolicy({ policy: undefined }),
      expectedHeaders,
    );
  });

  (["same-origin", "same-origin-allow-popups", "unsafe-none"] as const).forEach(
    (policy) => {
      it(`sets "Cross-Origin-Opener-Policy: ${policy}" when told to`, async () => {
        await check(crossOriginOpenerPolicy({ policy }), {
          "cross-origin-opener-policy": policy,
        });
      });
    },
  );

  it("throws when setting the policy to an invalid value", () => {
    const invalidValues = [
      "",
      "foo",
      "SAME-ORIGIN",
      123,
      null,
      new String("same-origin"),
    ];
    for (const policy of invalidValues) {
      assert.throws(() => crossOriginOpenerPolicy({ policy: policy as any }), {
        message: /^Cross-Origin-Opener-Policy does not support /,
      });
    }
  });
});
