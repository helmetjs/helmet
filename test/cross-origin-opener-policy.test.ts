import { check } from "./helpers";
import crossOriginOpenerPolicy from "../middlewares/cross-origin-opener-policy";

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
      expectedHeaders
    );
  });

  ["same-origin", "same-origin-allow-popups", "unsafe-none"].forEach(
    (policy) => {
      it(`sets "Cross-Origin-Opener-Policy: ${policy}" when told to`, async () => {
        await check(crossOriginOpenerPolicy({ policy }), {
          "cross-origin-opener-policy": policy,
        });
      });
    }
  );

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
      expect(() => crossOriginOpenerPolicy({ policy })).toThrow(
        /^Cross-Origin-Opener-Policy does not support /
      );
    }
  });
});
