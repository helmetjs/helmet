import type { IncomingMessage, ServerResponse } from "http";
import { check } from "./helpers";
import connect from "connect";
import supertest from "supertest";

import * as helmet from "..";

import contentSecurityPolicy from "../middlewares/content-security-policy";
import crossOriginEmbedderPolicy from "../middlewares/cross-origin-embedder-policy";
import crossOriginOpenerPolicy from "../middlewares/cross-origin-opener-policy";
import crossOriginResourcePolicy from "../middlewares/cross-origin-resource-policy";
import referrerPolicy from "../middlewares/referrer-policy";
import originAgentCluster from "../middlewares/origin-agent-cluster";
import strictTransportSecurity from "../middlewares/strict-transport-security";
import xContentTypeOptions from "../middlewares/x-content-type-options";
import xDnsPrefetchControl from "../middlewares/x-dns-prefetch-control";
import xDownloadOptions from "../middlewares/x-download-options";
import xFrameOptions from "../middlewares/x-frame-options";
import xPermittedCrossDomainPolicies from "../middlewares/x-permitted-cross-domain-policies";
import xPoweredBy from "../middlewares/x-powered-by";
import xXssProtection from "../middlewares/x-xss-protection";

describe("helmet", () => {
  const topLevel = helmet.default;

  it("includes all middleware, except COEP, with their default options", async () => {
    // NOTE: This test relies on the CSP object being ordered a certain way,
    // which could change (and be non-breaking). If that becomes a problem,
    // we should update this test to be more robust.
    const expectedHeaders = {
      "content-security-policy":
        "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
      "cross-origin-embedder-policy": null,
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-origin",
      "origin-agent-cluster": "?1",
      "referrer-policy": "no-referrer",
      "strict-transport-security": "max-age=15552000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-dns-prefetch-control": "off",
      "x-download-options": "noopen",
      "x-frame-options": "SAMEORIGIN",
      "x-permitted-cross-domain-policies": "none",
      "x-powered-by": null,
      "x-xss-protection": "0",
    };

    await check(topLevel(), expectedHeaders);
    await check(topLevel({}), expectedHeaders);
    await check(topLevel(Object.create(null)), expectedHeaders);
  });

  it("allows individual middlewares to be disabled", async () => {
    await check(topLevel({ contentSecurityPolicy: false }), {
      "content-security-policy": null,
    });
    await check(topLevel({ xDnsPrefetchControl: false }), {
      "x-dns-prefetch-control": null,
    });
  });

  it("works with all default middlewares disabled", async () => {
    await check(
      topLevel({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        originAgentCluster: false,
        referrerPolicy: false,
        strictTransportSecurity: false,
        xContentTypeOptions: false,
        xDnsPrefetchControl: false,
        xDownloadOptions: false,
        xFrameOptions: false,
        xPermittedCrossDomainPolicies: false,
        xPoweredBy: false,
        xXssProtection: false,
      }),
      {
        "content-security-policy": null,
        "x-frame-options": null,
      },
    );
  });

  it("errors when `use`d directly", () => {
    const fakeRequest = {
      constructor: {
        name: "IncomingMessage",
      },
    };

    expect(() => {
      topLevel(fakeRequest as any);
    }).toThrow();
  });

  it("allows default middleware to be explicitly enabled (a no-op)", async () => {
    await check(topLevel({ xFrameOptions: true }), {
      "x-frame-options": "SAMEORIGIN",
    });
  });

  it("allows Cross-Origin-Embedder-Policy middleware to be explicitly enabled", async () => {
    await check(topLevel({ crossOriginEmbedderPolicy: true }), {
      "cross-origin-embedder-policy": "require-corp",
    });
  });

  it("allows Cross-Origin-Embedder-Policy middleware to be explicitly disabled", async () => {
    await check(topLevel({ crossOriginEmbedderPolicy: false }), {
      "cross-origin-embedder-policy": null,
    });
  });

  it("allows Cross-Origin-Embedder-Policy middleware to be enabled with custom arguments", async () => {
    await check(
      topLevel({ crossOriginEmbedderPolicy: { policy: "credentialless" } }),
      {
        "cross-origin-embedder-policy": "credentialless",
      },
    );
  });

  it("allows Cross-Origin-Opener-Policy middleware to be enabled with its default", async () => {
    await check(topLevel({ crossOriginOpenerPolicy: true }), {
      "cross-origin-opener-policy": "same-origin",
    });
  });

  it("allows Cross-Origin-Opener-Policy middleware to be enabled with custom arguments", async () => {
    await check(
      topLevel({
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      }),
      {
        "cross-origin-opener-policy": "same-origin-allow-popups",
      },
    );
  });

  it("allows Cross-Origin-Opener-Policy middleware to be explicitly disabled", async () => {
    await check(topLevel({ crossOriginOpenerPolicy: false }), {
      "cross-origin-opener-policy": null,
    });
  });

  it("allows Cross-Origin-Resource-Policy middleware to be enabled with its default", async () => {
    await check(topLevel({ crossOriginResourcePolicy: true }), {
      "cross-origin-resource-policy": "same-origin",
    });
  });

  it("allows Cross-Origin-Resource-Policy middleware to be enabled with custom arguments", async () => {
    await check(
      topLevel({ crossOriginResourcePolicy: { policy: "same-site" } }),
      {
        "cross-origin-resource-policy": "same-site",
      },
    );
  });

  it("allows Cross-Origin-Resource-Policy middleware to be explicitly disabled", async () => {
    await check(topLevel({ crossOriginResourcePolicy: false }), {
      "cross-origin-resource-policy": null,
    });
  });

  it("allows Origin-Agent-Cluster middleware to be enabled", async () => {
    await check(topLevel({ originAgentCluster: true }), {
      "origin-agent-cluster": "?1",
    });
  });

  it("allows Origin-Agent-Cluster middleware to be explicitly disabled", async () => {
    await check(topLevel({ originAgentCluster: false }), {
      "origin-agent-cluster": null,
    });
  });

  it("properly handles a middleware calling `next()` with an error", async () => {
    const app = connect()
      .use(
        topLevel({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'", () => "bad;value"],
            },
          },
        }),
      )
      .use(
        (
          err: Error,
          _req: IncomingMessage,
          res: ServerResponse,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _next: () => void,
        ) => {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: err.message }));
        },
      );

    await supertest(app).get("/").expect(500, {
      message:
        'Content-Security-Policy received an invalid directive value for "default-src"',
    });
  });

  describe("warnings", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("logs a warning when passing options to xPoweredBy", () => {
      topLevel({ xPoweredBy: { setTo: "deprecated option" } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "X-Powered-By does not take options. Remove the property to silence this warning.",
      );
    });

    it("logs a warning when passing options to xDownloadOptions", () => {
      topLevel({ xDownloadOptions: { option: "foo" } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "X-Download-Options does not take options. Remove the property to silence this warning.",
      );
    });

    it("logs a warning when passing options to originAgentCluster", () => {
      topLevel({ originAgentCluster: { option: "foo" } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "Origin-Agent-Cluster does not take options. Remove the property to silence this warning.",
      );
    });

    it("logs a warning when passing options to xContentTypeOptions", () => {
      topLevel({ xContentTypeOptions: { option: "foo" } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "X-Content-Type-Options does not take options. Remove the property to silence this warning.",
      );
    });

    it("logs a warning when passing options to xXssProtection", () => {
      topLevel({ xXssProtection: { setOnOldIe: true } as any });

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "X-XSS-Protection does not take options. Remove the property to silence this warning.",
      );
    });
  });

  it("exposes standalone middleware", () => {
    expect(helmet.contentSecurityPolicy.name).toBe(contentSecurityPolicy.name);
    expect(helmet.contentSecurityPolicy.name).toBe("contentSecurityPolicy");

    expect(helmet.crossOriginEmbedderPolicy.name).toBe(
      crossOriginEmbedderPolicy.name,
    );
    expect(helmet.crossOriginEmbedderPolicy.name).toBe(
      "crossOriginEmbedderPolicy",
    );

    expect(helmet.crossOriginOpenerPolicy.name).toBe(
      crossOriginOpenerPolicy.name,
    );
    expect(helmet.crossOriginOpenerPolicy.name).toBe("crossOriginOpenerPolicy");

    expect(helmet.crossOriginResourcePolicy.name).toBe(
      crossOriginResourcePolicy.name,
    );
    expect(helmet.crossOriginResourcePolicy.name).toBe(
      "crossOriginResourcePolicy",
    );

    expect(helmet.originAgentCluster.name).toBe(originAgentCluster.name);
    expect(helmet.originAgentCluster.name).toBe("originAgentCluster");

    expect(helmet.referrerPolicy.name).toBe(referrerPolicy.name);
    expect(helmet.referrerPolicy.name).toBe("referrerPolicy");

    expect(helmet.strictTransportSecurity.name).toBe(
      strictTransportSecurity.name,
    );
    expect(helmet.strictTransportSecurity.name).toBe("strictTransportSecurity");

    expect(helmet.xContentTypeOptions.name).toBe(xContentTypeOptions.name);
    expect(helmet.xContentTypeOptions.name).toBe("xContentTypeOptions");

    expect(helmet.xDnsPrefetchControl.name).toBe(xDnsPrefetchControl.name);
    expect(helmet.xDnsPrefetchControl.name).toBe("xDnsPrefetchControl");

    expect(helmet.xDownloadOptions.name).toBe(xDownloadOptions.name);
    expect(helmet.xDownloadOptions.name).toBe("xDownloadOptions");

    expect(helmet.xFrameOptions.name).toBe(xFrameOptions.name);
    expect(helmet.xFrameOptions.name).toBe("xFrameOptions");

    expect(helmet.xPermittedCrossDomainPolicies.name).toBe(
      xPermittedCrossDomainPolicies.name,
    );
    expect(helmet.xPermittedCrossDomainPolicies.name).toBe(
      "xPermittedCrossDomainPolicies",
    );

    expect(helmet.xPoweredBy.name).toBe(xPoweredBy.name);
    expect(helmet.xPoweredBy.name).toBe("xPoweredBy");

    expect(helmet.xXssProtection.name).toBe(xXssProtection.name);
    expect(helmet.xXssProtection.name).toBe("xXssProtection");
  });

  it("exposes legacy header options", async () => {
    await check(topLevel({ hsts: { maxAge: 123 } }), {
      "strict-transport-security": "max-age=123; includeSubDomains",
    });
    await check(topLevel({ noSniff: false }), {
      "x-content-type-options": null,
    });
    await check(topLevel({ dnsPrefetchControl: { allow: true } }), {
      "x-dns-prefetch-control": "on",
    });
    await check(topLevel({ ieNoOpen: false }), {
      "x-download-options": null,
    });
    await check(topLevel({ frameguard: { action: "deny" } }), {
      "x-frame-options": "DENY",
    });
    await check(
      topLevel({
        permittedCrossDomainPolicies: { permittedPolicies: "by-content-type" },
      }),
      {
        "x-permitted-cross-domain-policies": "by-content-type",
      },
    );
    await check(topLevel({ hidePoweredBy: false }), {
      "x-powered-by": "Helmet test",
    });
    await check(topLevel({ xssFilter: false }), {
      "x-xss-protection": null,
    });
  });

  it("errors with conflicting header options (legacy + new)", () => {
    expect(() =>
      topLevel({ strictTransportSecurity: true, hsts: true } as any),
    ).toThrow();

    expect(() =>
      topLevel({ xContentTypeOptions: true, noSniff: true } as any),
    ).toThrow();

    expect(() =>
      topLevel({ xDnsPrefetchControl: true, dnsPrefetchControl: true } as any),
    ).toThrow();

    expect(() =>
      topLevel({ xDownloadOptions: true, ieNoOpen: true } as any),
    ).toThrow();

    expect(() =>
      topLevel({ xFrameOptions: true, frameguard: true } as any),
    ).toThrow();

    expect(() =>
      topLevel({
        xPermittedCrossDomainPolicies: true,
        permittedCrossDomainPolicies: true,
      } as any),
    ).toThrow();

    expect(() =>
      topLevel({ xPoweredBy: true, hidePoweredBy: true } as any),
    ).toThrow();

    expect(() =>
      topLevel({ xXssProtection: true, xssFilter: true } as any),
    ).toThrow();
  });

  it("exposes standalone middleware with legacy aliases", () => {
    expect(helmet.hsts.name).toBe(strictTransportSecurity.name);
    expect(helmet.dnsPrefetchControl.name).toBe(xDnsPrefetchControl.name);
    expect(helmet.ieNoOpen.name).toBe(xDownloadOptions.name);
    expect(helmet.frameguard.name).toBe(xFrameOptions.name);
    expect(helmet.noSniff.name).toBe(xContentTypeOptions.name);
    expect(helmet.hidePoweredBy.name).toBe(xPoweredBy.name);
    expect(helmet.permittedCrossDomainPolicies.name).toBe(
      xPermittedCrossDomainPolicies.name,
    );
    expect(helmet.xssFilter.name).toBe(xXssProtection.name);
  });
});
