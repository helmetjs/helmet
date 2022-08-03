import { check } from "./helpers";
import xFrameOptions from "../middlewares/x-frame-options";

describe("X-Frame-Options middleware", () => {
  it('sets "X-Frame-Options: SAMEORIGIN" when passed no action', async () => {
    await check(xFrameOptions(), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({}), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions(Object.create(null)), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: undefined }), {
      "x-frame-options": "SAMEORIGIN",
    });
  });

  it('can set "X-Frame-Options: DENY"', async () => {
    await check(xFrameOptions({ action: "deny" }), {
      "x-frame-options": "DENY",
    });

    // These are not allowed by the types, but are supported.
    await check(xFrameOptions({ action: "DENY" as any }), {
      "x-frame-options": "DENY",
    });
    await check(xFrameOptions({ action: "deNY" as any }), {
      "x-frame-options": "DENY",
    });
  });

  it('can set "X-Frame-Options: SAMEORIGIN" when specified', async () => {
    await check(xFrameOptions({ action: "sameorigin" }), {
      "x-frame-options": "SAMEORIGIN",
    });

    // These are not allowed by the types, but are supported.
    await check(xFrameOptions({ action: "SAMEORIGIN" as any }), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: "sameORIGIN" as any }), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: "SAME-ORIGIN" as any }), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: "same-origin" as any }), {
      "x-frame-options": "SAMEORIGIN",
    });
  });

  it("throws when passed invalid actions", () => {
    for (const action of [
      "",
      "foo",
      " deny",
      "allow-from",
      "ALLOW-FROM",
      123,
      null,
      new String("SAMEORIGIN"),
    ]) {
      expect(() => xFrameOptions({ action: action as any })).toThrow(
        /^X-Frame-Options received an invalid action /
      );
    }
  });
});
