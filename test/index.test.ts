import connect from "connect";
import assert from "node:assert/strict";
import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, it, type TestContext, type Mock } from "node:test";
import supertest from "supertest";
import { check } from "./helpers";

import * as helmet from "..";

import contentSecurityPolicy from "../middlewares/content-security-policy";
import crossOriginEmbedderPolicy from "../middlewares/cross-origin-embedder-policy";
import crossOriginOpenerPolicy from "../middlewares/cross-origin-opener-policy";
import crossOriginResourcePolicy from "../middlewares/cross-origin-resource-policy";
import originAgentCluster from "../middlewares/origin-agent-cluster";
import referrerPolicy from "../middlewares/referrer-policy";
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
      "strict-transport-security": "max-age=31536000; includeSubDomains",
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
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
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

    assert.throws(() => topLevel(fakeRequest as any));
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
    const mockWarn = (t: TestContext) =>
      t.mock.method(console, "warn", () => {});

    const assertWarns = (
      { mock }: Mock<() => unknown>,
      message: string,
    ): void => {
      assert.equal(mock.callCount(), 1);
      assert.deepEqual(mock.calls[0]?.arguments, [message]);
    };

    it("logs a warning when passing options to xPoweredBy", (t) => {
      const warn = mockWarn(t);
      topLevel({ xPoweredBy: { setTo: "deprecated option" } as any });
      assertWarns(
        warn,
        "X-Powered-By does not take options. Remove the property to silence this warning.",
      );
    });

    it("logs a warning when passing options to xDownloadOptions", (t) => {
      const warn = mockWarn(t);
      topLevel({ xDownloadOptions: { option: "foo" } as any });
      assertWarns(
        warn,
        "X-Download-Options does not take options. Remove the property to silence this warning.",
      );
    });

    it("logs a warning when passing options to originAgentCluster", (t) => {
      const warn = mockWarn(t);
      topLevel({ originAgentCluster: { option: "foo" } as any });
      assertWarns(
        warn,
        "Origin-Agent-Cluster does not take options. Remove the property to silence this warning.",
      );
    });

    it("logs a warning when passing options to xContentTypeOptions", (t) => {
      const warn = mockWarn(t);
      topLevel({ xContentTypeOptions: { option: "foo" } as any });
      assertWarns(
        warn,
        "X-Content-Type-Options does not take options. Remove the property to silence this warning.",
      );
    });

    it("logs a warning when passing options to xXssProtection", (t) => {
      const warn = mockWarn(t);
      topLevel({ xXssProtection: { setOnOldIe: true } as any });
      assertWarns(
        warn,
        "X-XSS-Protection does not take options. Remove the property to silence this warning.",
      );
    });
  });

  it("exposes standalone middleware", () => {
    assert.strictEqual(
      helmet.contentSecurityPolicy.name,
      contentSecurityPolicy.name,
    );
    assert.strictEqual(
      helmet.contentSecurityPolicy.name,
      "contentSecurityPolicy",
    );

    assert.strictEqual(
      helmet.crossOriginEmbedderPolicy.name,
      crossOriginEmbedderPolicy.name,
    );
    assert.strictEqual(
      helmet.crossOriginEmbedderPolicy.name,
      "crossOriginEmbedderPolicy",
    );

    assert.strictEqual(
      helmet.crossOriginOpenerPolicy.name,
      crossOriginOpenerPolicy.name,
    );
    assert.strictEqual(
      helmet.crossOriginOpenerPolicy.name,
      "crossOriginOpenerPolicy",
    );

    assert.strictEqual(
      helmet.crossOriginResourcePolicy.name,
      crossOriginResourcePolicy.name,
    );
    assert.strictEqual(
      helmet.crossOriginResourcePolicy.name,
      "crossOriginResourcePolicy",
    );

    assert.strictEqual(helmet.originAgentCluster.name, originAgentCluster.name);
    assert.strictEqual(helmet.originAgentCluster.name, "originAgentCluster");

    assert.strictEqual(helmet.referrerPolicy.name, referrerPolicy.name);
    assert.strictEqual(helmet.referrerPolicy.name, "referrerPolicy");

    assert.strictEqual(
      helmet.strictTransportSecurity.name,
      strictTransportSecurity.name,
    );
    assert.strictEqual(
      helmet.strictTransportSecurity.name,
      "strictTransportSecurity",
    );

    assert.strictEqual(
      helmet.xContentTypeOptions.name,
      xContentTypeOptions.name,
    );
    assert.strictEqual(helmet.xContentTypeOptions.name, "xContentTypeOptions");

    assert.strictEqual(
      helmet.xDnsPrefetchControl.name,
      xDnsPrefetchControl.name,
    );
    assert.strictEqual(helmet.xDnsPrefetchControl.name, "xDnsPrefetchControl");

    assert.strictEqual(helmet.xDownloadOptions.name, xDownloadOptions.name);
    assert.strictEqual(helmet.xDownloadOptions.name, "xDownloadOptions");

    assert.strictEqual(helmet.xFrameOptions.name, xFrameOptions.name);
    assert.strictEqual(helmet.xFrameOptions.name, "xFrameOptions");

    assert.strictEqual(
      helmet.xPermittedCrossDomainPolicies.name,
      xPermittedCrossDomainPolicies.name,
    );
    assert.strictEqual(
      helmet.xPermittedCrossDomainPolicies.name,
      "xPermittedCrossDomainPolicies",
    );

    assert.strictEqual(helmet.xPoweredBy.name, xPoweredBy.name);
    assert.strictEqual(helmet.xPoweredBy.name, "xPoweredBy");

    assert.strictEqual(helmet.xXssProtection.name, xXssProtection.name);
    assert.strictEqual(helmet.xXssProtection.name, "xXssProtection");
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
    assert.throws(() =>
      topLevel({ strictTransportSecurity: true, hsts: true } as any),
    );

    assert.throws(() =>
      topLevel({ xContentTypeOptions: true, noSniff: true } as any),
    );

    assert.throws(() =>
      topLevel({ xDnsPrefetchControl: true, dnsPrefetchControl: true } as any),
    );

    assert.throws(() =>
      topLevel({ xDownloadOptions: true, ieNoOpen: true } as any),
    );

    assert.throws(() =>
      topLevel({ xFrameOptions: true, frameguard: true } as any),
    );

    assert.throws(() =>
      topLevel({
        xPermittedCrossDomainPolicies: true,
        permittedCrossDomainPolicies: true,
      } as any),
    );

    assert.throws(() =>
      topLevel({ xPoweredBy: true, hidePoweredBy: true } as any),
    );

    assert.throws(() =>
      topLevel({ xXssProtection: true, xssFilter: true } as any),
    );
  });

  it("exposes standalone middleware with legacy aliases", () => {
    assert.strictEqual(helmet.hsts.name, strictTransportSecurity.name);
    assert.strictEqual(
      helmet.dnsPrefetchControl.name,
      xDnsPrefetchControl.name,
    );
    assert.strictEqual(helmet.ieNoOpen.name, xDownloadOptions.name);
    assert.strictEqual(helmet.frameguard.name, xFrameOptions.name);
    assert.strictEqual(helmet.noSniff.name, xContentTypeOptions.name);
    assert.strictEqual(helmet.hidePoweredBy.name, xPoweredBy.name);
    assert.strictEqual(
      helmet.permittedCrossDomainPolicies.name,
      xPermittedCrossDomainPolicies.name,
    );
    assert.strictEqual(helmet.xssFilter.name, xXssProtection.name);
  });
});
