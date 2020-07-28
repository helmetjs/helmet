import { check } from "./helpers";

import helmet from "..";

import contentSecurityPolicy from "../middlewares/content-security-policy";
import expectCt from "../middlewares/expect-ct";
import referrerPolicy from "../middlewares/referrer-policy";
import strictTransportSecurity from "../middlewares/strict-transport-security";
import xContentTypeOptions from "../middlewares/x-content-type-options";
import xDnsPrefetchControl from "../middlewares/x-dns-prefetch-control";
import xDowloadOptions from "../middlewares/x-download-options";
import xFrameOptions from "../middlewares/x-frame-options";
import xPermittedCrossDomainPolicies from "../middlewares/x-permitted-cross-domain-policies";
import xPoweredBy from "../middlewares/x-powered-by";
import xXssProtection from "../middlewares/x-xss-protection";

describe("helmet", () => {
  it("includes all middleware with their default options", async () => {
    await check(helmet(), {
      // NOTE: This test relies on the object being ordered a certain way,
      // which could change (and be non-breaking). If that becomes a problem,
      // we should update this test to be more robust.
      "content-security-policy":
        "default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
      "expect-ct": "max-age=0",
      "referrer-policy": "no-referrer",
      "strict-transport-security": "max-age=15552000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-dns-prefetch-control": "off",
      "x-download-options": "noopen",
      "x-frame-options": "SAMEORIGIN",
      "x-permitted-cross-domain-policies": "none",
      "x-powered-by": null,
      "x-xss-protection": "0",
    });
  });

  it("allows individual middlewares to be disabled", async () => {
    await check(helmet({ contentSecurityPolicy: false }), {
      "content-security-policy": null,
    });
    await check(helmet({ dnsPrefetchControl: false }), {
      "x-dns-prefetch-control": null,
    });
  });

  it("errors when `use`d directly", () => {
    const fakeRequest = {
      constructor: {
        name: "IncomingMessage",
      },
    };

    expect(() => {
      helmet(fakeRequest as any);
    }).toThrow();
  });

  it("errors when passing `true` as a middleware option", () => {
    expect(() => {
      helmet({ contentSecurityPolicy: true as any });
    }).toThrow(
      "Helmet no longer supports `true` as a middleware option. Remove the property from your options to fix this error."
    );
  });

  describe("warnings", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("logs a warning when passing options to hidePoweredBy", () => {
      helmet({ hidePoweredBy: { setTo: "deprecated option" } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "hidePoweredBy does not take options. Remove the property to silence this warning."
      );
    });

    it("logs a warning when passing options to ieNoOpen", () => {
      helmet({ ieNoOpen: { option: "foo" } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "ieNoOpen does not take options. Remove the property to silence this warning."
      );
    });

    it("logs a warning when passing options to noSniff", () => {
      helmet({ noSniff: { option: "foo" } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "noSniff does not take options. Remove the property to silence this warning."
      );
    });

    it("logs a warning when passing options to xssFilter", () => {
      helmet({ xssFilter: { setOnOldIe: true } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "xssFilter does not take options. Remove the property to silence this warning."
      );
    });

    it("logs a warning when passing options to hidePoweredBy", () => {
      helmet({ hidePoweredBy: { setTo: "deprecated option" } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "hidePoweredBy does not take options. Remove the property to silence this warning."
      );
    });
  });

  describe("module aliases", () => {
    it("aliases the X-DNS-Prefetch-Control middleware to helmet.dnsPrefetchControl", () => {
      expect(helmet.dnsPrefetchControl.name).toBe(xDnsPrefetchControl.name);
      expect(helmet.dnsPrefetchControl.name).toBe("xDnsPrefetchControl");
    });

    it("aliases the X-Content-Type-Options middleware to helmet.noSniff", () => {
      expect(helmet.noSniff.name).toBe(xContentTypeOptions.name);
      expect(helmet.noSniff.name).toBe("xContentTypeOptions");
    });

    it("aliases the Expect-CT middleware to helmet.expectCt", () => {
      expect(helmet.expectCt.name).toBe(expectCt.name);
      expect(helmet.expectCt.name).toBe("expectCt");
    });

    it("aliases the X-Permitted-Cross-Domain-Policies middleware to helmet.crossdomain", () => {
      expect(helmet.permittedCrossDomainPolicies.name).toBe(
        xPermittedCrossDomainPolicies.name
      );
      expect(helmet.permittedCrossDomainPolicies.name).toBe(
        "xPermittedCrossDomainPolicies"
      );
    });

    it("aliases the X-Frame-Options middleware to helmet.frameguard", () => {
      expect(helmet.frameguard.name).toBe(xFrameOptions.name);
      expect(helmet.frameguard.name).toBe("xFrameOptions");
    });

    it("aliases the Content-Security-Policy middleware to helmet.contentSecurityPolicy", () => {
      expect(helmet.contentSecurityPolicy.name).toBe(
        contentSecurityPolicy.name
      );
      expect(helmet.contentSecurityPolicy.name).toBe("contentSecurityPolicy");
    });

    it("aliases the X-Powered-By middleware to helmet.hidePoweredBy", () => {
      expect(helmet.hidePoweredBy.name).toBe(xPoweredBy.name);
      expect(helmet.hidePoweredBy.name).toBe("xPoweredBy");
    });

    it("aliases the Strict-Transport-Security middleware to helmet.hsts", () => {
      expect(helmet.hsts.name).toBe(strictTransportSecurity.name);
      expect(helmet.hsts.name).toBe("strictTransportSecurity");
    });

    it("aliases the X-Download-Options middleware to helmet.ieNoOpen", () => {
      expect(helmet.ieNoOpen.name).toBe(xDowloadOptions.name);
      expect(helmet.ieNoOpen.name).toBe("xDownloadOptions");
    });

    it("aliases the Referrer-Policy middleware to helmet.referrerPolicy", () => {
      expect(helmet.referrerPolicy.name).toBe(referrerPolicy.name);
      expect(helmet.referrerPolicy.name).toBe("referrerPolicy");
    });

    it("aliases the X-XSS-Protection middleware to helmet.xssFilter", () => {
      expect(helmet.xssFilter.name).toBe(xXssProtection.name);
      expect(helmet.xssFilter.name).toBe("xXssProtection");
    });
  });
});
