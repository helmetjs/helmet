import { check } from "./helpers";
import crossOriginEmbedderPolicy from "../middlewares/cross-origin-embedder-policy";

describe("Cross-Origin-Embedder-Policy middleware", () => {
  it('sets "Cross-Origin-Embedder-Policy: same-origin" when called with no policy', async () => {
    const expectedHeaders = {
      "cross-origin-embedder-policy": "require-corp",
    };
    await check(crossOriginEmbedderPolicy(), expectedHeaders);
    await check(crossOriginEmbedderPolicy({}), expectedHeaders);
    await check(
      crossOriginEmbedderPolicy(Object.create(null)),
      expectedHeaders
    );
    await check(
      crossOriginEmbedderPolicy({ policy: undefined }),
      expectedHeaders
    );
  });

  ["require-corp", "credentialless"].forEach((policy) => {
    it(`sets "Cross-Origin-Embedder-Policy: ${policy}" when told to`, async () => {
      await check(crossOriginEmbedderPolicy({ policy }), {
        "cross-origin-embedder-policy": policy,
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
      expect(() => crossOriginEmbedderPolicy({ policy })).toThrow(
        /^Cross-Origin-Embedder-Policy does not support /
      );
    }
  });
});
