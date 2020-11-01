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
    await check(xFrameOptions({ action: "DENY" }), {
      "x-frame-options": "DENY",
    });
    await check(xFrameOptions({ action: "deny" }), {
      "x-frame-options": "DENY",
    });
    await check(xFrameOptions({ action: "deNY" }), {
      "x-frame-options": "DENY",
    });
  });

  it('can set "X-Frame-Options: SAMEORIGIN" when specified', async () => {
    await check(xFrameOptions({ action: "SAMEORIGIN" }), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: "sameorigin" }), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: "sameORIGIN" }), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: "SAME-ORIGIN" }), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: "same-origin" }), {
      "x-frame-options": "SAMEORIGIN",
    });
  });

  it("throws when passed invalid actions", () => {
    for (const action of ["allow-from", "ALLOW-FROM"]) {
      expect(() => xFrameOptions({ action })).toThrow(
        /^X-Frame-Options no longer supports `ALLOW-FROM` due to poor browser support. See <https:\/\/github.com\/helmetjs\/helmet\/wiki\/How-to-use-X%E2%80%93Frame%E2%80%93Options's-%60ALLOW%E2%80%93FROM%60-directive> for more info.$/
      );
    }

    for (const action of ["garbage", "", 123 as any, null as any]) {
      expect(() => xFrameOptions({ action })).toThrow(
        /^X-Frame-Options received an invalid action /
      );
    }
  });
});
