import assert from "node:assert/strict";
import { describe, it } from "node:test";
import crossOriginResourcePolicy from "../middlewares/cross-origin-resource-policy";
import { check } from "./helpers";

describe("Cross-Origin-Resource-Policy middleware", () => {
  it('sets "Cross-Origin-Resource-Policy: same-origin" when called with no policy', async () => {
    const expectedHeaders = {
      "cross-origin-resource-policy": "same-origin",
    };
    await check(crossOriginResourcePolicy(), expectedHeaders);
    await check(crossOriginResourcePolicy({}), expectedHeaders);
    await check(
      crossOriginResourcePolicy(Object.create(null)),
      expectedHeaders,
    );
    await check(
      crossOriginResourcePolicy({ policy: undefined }),
      expectedHeaders,
    );
  });

  (["same-origin", "same-site", "cross-origin"] as const).forEach((policy) => {
    it(`sets "Cross-Origin-Resource-Policy: ${policy}" when told to`, async () => {
      await check(crossOriginResourcePolicy({ policy }), {
        "cross-origin-resource-policy": policy,
      });
    });
  });

  it("throws when setting the policy to an invalid value", () => {
    const invalidValues = [
      "",
      "foo",
      "CROSS-ORIGIN",
      123,
      null,
      new String("none"),
    ];
    for (const policy of invalidValues) {
      assert.throws(
        () => crossOriginResourcePolicy({ policy: policy as any }),
        { message: /^Cross-Origin-Resource-Policy does not support / },
      );
    }
  });
});
