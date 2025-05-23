import assert from "node:assert/strict";
import { describe, it } from "node:test";
import xPermittedCrossDomainPolicies from "../middlewares/x-permitted-cross-domain-policies";
import { check } from "./helpers";

describe("X-Permitted-Cross-Domain-Policies middleware", () => {
  it('sets "X-Permitted-Cross-Domain-Policies: none" when called with no permitted policies', async () => {
    const expectedHeaders = {
      "x-permitted-cross-domain-policies": "none",
    };
    await check(xPermittedCrossDomainPolicies(), expectedHeaders);
    await check(xPermittedCrossDomainPolicies({}), expectedHeaders);
    await check(
      xPermittedCrossDomainPolicies(Object.create(null)),
      expectedHeaders,
    );
    await check(
      xPermittedCrossDomainPolicies({ permittedPolicies: undefined }),
      expectedHeaders,
    );
  });

  (["none", "master-only", "by-content-type", "all"] as const).forEach(
    (permittedPolicies) => {
      it(`sets "X-Permitted-Cross-Domain-Policies: ${permittedPolicies}" when told to`, async () => {
        await check(xPermittedCrossDomainPolicies({ permittedPolicies }), {
          "x-permitted-cross-domain-policies": permittedPolicies,
        });
      });
    },
  );

  it("throws when setting the policy to an invalid value", () => {
    const invalidValues = [
      "",
      "NONE",
      "by-ftp-filename",
      123,
      null,
      new String("none"),
    ];
    for (const permittedPolicies of invalidValues) {
      assert.throws(
        () =>
          xPermittedCrossDomainPolicies({
            permittedPolicies: permittedPolicies as any,
          }),
        { message: /^X-Permitted-Cross-Domain-Policies does not support / },
      );
    }
  });
});
