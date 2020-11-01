import { check } from "./helpers";
import referrerPolicy from "../middlewares/referrer-policy";

describe("Referrer-Policy middleware", () => {
  it("sets header to no-referrer when passed no policy", async () => {
    await check(referrerPolicy(), {
      "referrer-policy": "no-referrer",
    });
    await check(referrerPolicy({}), {
      "referrer-policy": "no-referrer",
    });
    await check(referrerPolicy(Object.create(null)), {
      "referrer-policy": "no-referrer",
    });
    await check(referrerPolicy({ policy: undefined }), {
      "referrer-policy": "no-referrer",
    });
  });

  [
    "no-referrer",
    "no-referrer-when-downgrade",
    "same-origin",
    "origin",
    "strict-origin",
    "origin-when-cross-origin",
    "strict-origin-when-cross-origin",
    "unsafe-url",
    "",
  ].forEach((policy) => {
    it(`can set the header to "${policy}" by specifying it as a string`, async () => {
      await check(referrerPolicy({ policy }), {
        "referrer-policy": policy,
      });
    });

    it(`can set the header to "${policy}" by specifying it as an array string`, async () => {
      await check(referrerPolicy({ policy: [policy] }), {
        "referrer-policy": policy,
      });
    });
  });

  it("can set an array with multiple values", async () => {
    await check(referrerPolicy({ policy: ["origin", "unsafe-url"] }), {
      "referrer-policy": "origin,unsafe-url",
    });
  });

  it("fails with a bad policy", () => {
    expect(referrerPolicy.bind(null, { policy: "garbage" })).toThrow();
    expect(referrerPolicy.bind(null, { policy: "sameorigin" })).toThrow();
    expect(referrerPolicy.bind(null, { policy: 123 as any })).toThrow();
    expect(referrerPolicy.bind(null, { policy: false as any })).toThrow();
    expect(referrerPolicy.bind(null, { policy: null as any })).toThrow();
    expect(referrerPolicy.bind(null, { policy: {} as any })).toThrow();
  });

  it("fails with an empty array", () => {
    expect(referrerPolicy.bind(null, { policy: [] })).toThrow();
  });

  it("fails with duplicate values", () => {
    expect(
      referrerPolicy.bind(null, { policy: ["origin", "origin"] })
    ).toThrow();
    expect(
      referrerPolicy.bind(null, {
        policy: ["same-origin", "origin", "same-origin"],
      })
    ).toThrow();
  });
});
