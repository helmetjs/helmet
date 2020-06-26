import { check } from "./helpers";
import xFrameOptions from "../middlewares/x-frame-options";

describe("X-Frame-Options middleware", () => {
  it("sets header to SAMEORIGIN with no action", async () => {
    await check(xFrameOptions(), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({}), {
      "x-frame-options": "SAMEORIGIN",
    });
    await check(xFrameOptions({ action: undefined }), {
      "x-frame-options": "SAMEORIGIN",
    });
  });

  it('can set the header value to "DENY" when passed as a string', async () => {
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

  it('can set the header value to "SAMEORIGIN"', async () => {
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

  it('can set the action to "ALLOW-FROM"', async () => {
    await check(
      xFrameOptions({ action: "ALLOW-FROM", domain: "https://example.com" }),
      {
        "x-frame-options": "ALLOW-FROM https://example.com",
      }
    );

    await check(
      xFrameOptions({ action: "allow-FROM", domain: "https://example.com" }),
      {
        "x-frame-options": "ALLOW-FROM https://example.com",
      }
    );

    await check(
      xFrameOptions({ action: "ALLOWFROM", domain: "https://example.com" }),
      {
        "x-frame-options": "ALLOW-FROM https://example.com",
      }
    );
    await check(
      xFrameOptions({ action: "allowFROM", domain: "https://example.com" }),
      {
        "x-frame-options": "ALLOW-FROM https://example.com",
      }
    );
  });

  it('works with String object set to "SAMEORIGIN" and doesn\'t change them', async () => {
    const str = new String("SAMEORIGIN"); // eslint-disable-line no-new-wrappers
    await check(xFrameOptions({ action: str as any }), {
      "x-frame-options": "SAMEORIGIN",
    });
    expect(str.valueOf()).toBe("SAMEORIGIN");
  });

  it("works with ALLOW-FROM with String objects and doesn't change them", async () => {
    const directive = new String("ALLOW-FROM"); // eslint-disable-line no-new-wrappers
    const url = new String("http://example.com"); // eslint-disable-line no-new-wrappers
    await check(
      xFrameOptions({ action: directive as any, domain: url as any }),
      {
        "x-frame-options": "ALLOW-FROM http://example.com",
      }
    );
    expect(directive.valueOf()).toBe("ALLOW-FROM");
    expect(url.valueOf()).toBe("http://example.com");
  });

  it("fails with a bad action", () => {
    expect(xFrameOptions.bind(null, { action: " " })).toThrow();
    expect(xFrameOptions.bind(null, { action: "denyy" })).toThrow();
    expect(xFrameOptions.bind(null, { action: "DENNY" })).toThrow();
    expect(xFrameOptions.bind(null, { action: " deny " })).toThrow();
    expect(xFrameOptions.bind(null, { action: " DENY " })).toThrow();
    expect(xFrameOptions.bind(null, { action: 123 as any })).toThrow();
    expect(xFrameOptions.bind(null, { action: false as any })).toThrow();
    expect(xFrameOptions.bind(null, { action: null as any })).toThrow();
    expect(xFrameOptions.bind(null, { action: {} as any })).toThrow();
    expect(xFrameOptions.bind(null, { action: [] as any })).toThrow();
    expect(
      xFrameOptions.bind(null, {
        action: ["ALLOW-FROM", "http://example.com"] as any,
      })
    ).toThrow();
    expect(
      xFrameOptions.bind(null, { action: /cool_regex/g as any })
    ).toThrow();
  });

  it('fails with a bad domain if the action is "ALLOW-FROM"', () => {
    expect(xFrameOptions.bind(null, { action: "ALLOW-FROM" })).toThrow();
    expect(
      xFrameOptions.bind(null, { action: "ALLOW-FROM", domain: null as any })
    ).toThrow();
    expect(
      xFrameOptions.bind(null, { action: "ALLOW-FROM", domain: false as any })
    ).toThrow();
    expect(
      xFrameOptions.bind(null, { action: "ALLOW-FROM", domain: 123 as any })
    ).toThrow();
    expect(
      xFrameOptions.bind(null, { action: "ALLOW-FROM", domain: "" })
    ).toThrow();
    expect(
      xFrameOptions.bind(null, {
        action: "ALLOW-FROM",
        domain: ["http://website.com", "http//otherwebsite.com"] as any,
      })
    ).toThrow();
  });
});
