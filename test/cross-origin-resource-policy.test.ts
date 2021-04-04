import { check } from "./helpers";
import crossOriginResourcePolicy from "../middlewares/cross-origin-resource-policy";

describe("Cross-Origin-Resource-Policy middleware", () => {
  it('sets "Cross-Origin-Resource-Policy: same-origin" when called with no policy', async () => {
    const expectedHeaders = {
      "cross-origin-resource-policy": "same-origin",
    };
    await check(crossOriginResourcePolicy(), expectedHeaders);
    await check(crossOriginResourcePolicy({}), expectedHeaders);
    await check(
      crossOriginResourcePolicy(Object.create(null)),
      expectedHeaders
    );
    await check(
      crossOriginResourcePolicy({ policy: undefined }),
      expectedHeaders
    );
  });

  ["same-origin", "same-site", "cross-origin"].forEach((policy) => {
    it(`sets "Cross-Origin-Resource-Policy: ${policy}" when told to`, async () => {
      await check(crossOriginResourcePolicy({ policy }), {
        "cross-origin-resource-policy": policy,
      });
    });
  });

  it("throws when setting the policy to an invalid value", () => {
    const invalidValues = [
      "",
      "NONE",
      "by-ftp-filename",
      123 as any,
      null as any,
      new String("none") as any,
    ];
    for (const policy of invalidValues) {
      expect(() => crossOriginResourcePolicy({ policy })).toThrow(
        /^Cross-Origin-Resource-Policy does not support /
      );
    }
  });
});
