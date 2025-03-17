import connect from "connect";
import assert from "node:assert/strict";
import { IncomingMessage, ServerResponse } from "node:http";
import { describe, it } from "node:test";
import supertest from "supertest";
import contentSecurityPolicy, {
  dangerouslyDisableDefaultSrc,
  getDefaultDirectives,
} from "../middlewares/content-security-policy";
import { check } from "./helpers";

const shouldBeQuoted = [
  "none",
  "self",
  "strict-dynamic",
  "report-sample",
  "inline-speculation-rules",
  "unsafe-inline",
  "unsafe-eval",
  "unsafe-hashes",
  "wasm-unsafe-eval",
  "nonce-abc123",
  "sha256-ks9D5epDKP+c2x6DrkuHmhmfKkOM/HZ+pOlzdWbI91k=",
];

const getOwn = <T extends object, K extends keyof T>(
  obj: T,
  key: K,
): T[K] | undefined => (Object.hasOwn(obj, key) ? obj[key] : undefined);

async function checkCsp({
  middlewareArgs,
  expectedHeader = "content-security-policy",
  expectedDirectives,
}: Readonly<{
  middlewareArgs: Parameters<typeof contentSecurityPolicy>;
  expectedHeader?: string;
  expectedDirectives: Set<string>;
}>): Promise<void> {
  const { header } = await check(contentSecurityPolicy(...middlewareArgs), {});
  const headerValue = getOwn(header, expectedHeader);
  assert(
    typeof headerValue === "string",
    `${expectedHeader} header should be set`,
  );
  const actualDirectives = new Set(headerValue.split(";"));
  assert.deepEqual(actualDirectives, expectedDirectives);
}

describe("Content-Security-Policy middleware", () => {
  it("sets a default policy when passed no directives", async () => {
    const expectedDirectives = new Set([
      "default-src 'self'",
      "base-uri 'self'",
      "font-src 'self' https: data:",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "img-src 'self' data:",
      "object-src 'none'",
      "script-src 'self'",
      "script-src-attr 'none'",
      "style-src 'self' https: 'unsafe-inline'",
      "upgrade-insecure-requests",
    ]);
    await checkCsp({
      middlewareArgs: [],
      expectedDirectives,
    });
    await checkCsp({
      middlewareArgs: [{}],
      expectedDirectives,
    });
    await checkCsp({
      middlewareArgs: [Object.create(null)],
      expectedDirectives,
    });
    await checkCsp({
      middlewareArgs: [{ directives: undefined }],
      expectedDirectives,
    });
    await checkCsp({
      middlewareArgs: [{ useDefaults: true }],
      expectedDirectives,
    });
  });

  it("sets directives when named with snake-case", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": ["'self'"],
            "script-src": ["example.com"],
            "style-src": ["'none'"],
          },
        },
      ],
      expectedDirectives: new Set([
        "default-src 'self'",
        "script-src example.com",
        "style-src 'none'",
      ]),
    });
  });

  it("sets directives when named with camelCase", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["example.com"],
            styleSrc: ["'none'"],
          },
        },
      ],
      expectedDirectives: new Set([
        "default-src 'self'",
        "script-src example.com",
        "style-src 'none'",
      ]),
    });
  });

  it("accepts a mix of snake-case and camelCase directive names", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": ["'self'"],
            "script-src": ["example.com"],
            styleSrc: ["'none'"],
            objectSrc: ["'none'"],
          },
        },
      ],
      expectedDirectives: new Set([
        "default-src 'self'",
        "script-src example.com",
        "style-src 'none'",
        "object-src 'none'",
      ]),
    });
  });

  it("accepts an empty list of directive values", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": ["'self'"],
            sandbox: [],
          },
        },
      ],
      expectedDirectives: new Set(["default-src 'self'", "sandbox"]),
    });
  });

  it("accepts non-array iterables for directive values", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": new Set(["'self'"]),
            sandbox: {
              [Symbol.iterator]: () => ({
                next: () => ({
                  done: true,
                  value: undefined,
                }),
              }),
            },
          },
        },
      ],
      expectedDirectives: new Set(["default-src 'self'", "sandbox"]),
    });
  });

  it("accepts strings as directive values", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": "'self'  example.com",
            scriptSrc: "'none'",
            sandbox: "",
          },
        },
      ],
      expectedDirectives: new Set([
        "default-src 'self'  example.com",
        "script-src 'none'",
        "sandbox",
      ]),
    });
  });

  it("treats null directive values as nothing, as if they weren't set", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": "'self'",
            scriptSrc: null,
          },
        },
      ],
      expectedDirectives: new Set(["default-src 'self'"]),
    });
  });

  it("allows functions in directive values to generate dynamic directives", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": [
              "'self'",
              (req: IncomingMessage, res: ServerResponse) => {
                assert(
                  req instanceof IncomingMessage,
                  "req should be a request",
                );
                assert(
                  res instanceof ServerResponse,
                  "res should be a response",
                );
                return "foo.example.com";
              },
              "bar.example.com",
            ],
          },
        },
      ],
      expectedDirectives: new Set([
        "default-src 'self' foo.example.com bar.example.com",
      ]),
    });
  });

  it("can override the default options", async () => {
    const expectedDirectives = new Set([
      "default-src 'self' example.com",
      "font-src 'self' https: data:",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "img-src 'self' data:",
      "object-src 'none'",
      "script-src example.com",
      "script-src-attr 'none'",
      "style-src 'self' https: 'unsafe-inline'",
      "upgrade-insecure-requests",
    ]);

    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: true,
          directives: {
            "default-src": ["'self'", "example.com"],
            "base-uri": null,
            scriptSrc: ["example.com"],
          },
        },
      ],
      expectedDirectives,
    });

    await checkCsp({
      middlewareArgs: [
        {
          directives: {
            "default-src": ["'self'", "example.com"],
            "base-uri": null,
            scriptSrc: ["example.com"],
          },
        },
      ],
      expectedDirectives,
    });
  });

  it('can set the "report only" version of the header instead', async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": "'self'",
          },
          reportOnly: true,
        },
      ],
      expectedHeader: "content-security-policy-report-only",
      expectedDirectives: new Set(["default-src 'self'"]),
    });
  });

  it("throws if any directive names are invalid", () => {
    const invalidNames = [
      "",
      ";",
      "\u00e1",
      "default src",
      "default;src",
      "default,src",
      "default!src",
      "def\u00e1ult-src",
      "default_src",
      "__proto__",
    ];
    for (const name of invalidNames) {
      assert.throws(
        () => {
          contentSecurityPolicy({
            useDefaults: true,
            directives: {
              [name]: ["value"],
            },
          });
        },
        {
          message:
            /^Content-Security-Policy received an invalid directive name "/,
        },
      );
    }
  });

  it("throws if duplicate directive names are found", () => {
    assert.throws(
      () => {
        contentSecurityPolicy({
          useDefaults: false,
          directives: {
            defaultSrc: ["foo"],
            "default-src": ["foo"],
          },
        });
      },
      {
        message:
          /^Content-Security-Policy received a duplicate directive "default-src"$/,
      },
    );

    assert.throws(
      () => {
        contentSecurityPolicy({
          useDefaults: false,
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["foo"],
            "script-src": ["foo"],
          },
        });
      },
      {
        message:
          /^Content-Security-Policy received a duplicate directive "script-src"$/,
      },
    );
  });

  it("throws if any directive values are invalid", () => {
    const invalidValues = [
      ";",
      ",",
      "hello;world",
      "hello,world",
      ...shouldBeQuoted,
    ];
    for (const invalidValue of invalidValues) {
      assert.throws(
        () => {
          contentSecurityPolicy({
            useDefaults: false,
            directives: {
              "default-src": "'self'",
              "something-else": [invalidValue],
            },
          });
        },
        {
          message:
            /^Content-Security-Policy received an invalid directive value for "something-else"$/,
        },
      );
    }
  });

  it("errors if any directive values are invalid when a function returns", async () => {
    const badDirectiveValueEntries = ["bad;value", ...shouldBeQuoted];

    await Promise.all(
      badDirectiveValueEntries.map(async (directiveValueEntry) => {
        const app = connect()
          .use(
            contentSecurityPolicy({
              useDefaults: false,
              directives: {
                defaultSrc: ["'self'", () => directiveValueEntry],
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
              res.end(
                JSON.stringify({ helmetTestError: true, message: err.message }),
              );
            },
          );

        await supertest(app).get("/").expect(500, {
          helmetTestError: true,
          message:
            'Content-Security-Policy received an invalid directive value for "default-src"',
        });
      }),
    );
  });

  it("throws if default-src is missing", () => {
    assert.throws(
      () => {
        contentSecurityPolicy({
          useDefaults: false,
          directives: {},
        });
      },
      {
        message:
          /^Content-Security-Policy has no directives. Either set some or disable the header$/,
      },
    );
    assert.throws(
      () => {
        contentSecurityPolicy({
          useDefaults: false,
          directives: {
            scriptSrc: ["example.com"],
          },
        });
      },
      {
        message:
          /^Content-Security-Policy needs a default-src but none was provided. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.$/,
      },
    );
    assert.throws(
      () => {
        contentSecurityPolicy({
          directives: { defaultSrc: null },
        });
      },
      {
        message:
          /^Content-Security-Policy needs a default-src but it was set to `null`. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.$/,
      },
    );

    // These should not throw.
    contentSecurityPolicy({
      useDefaults: false,
      directives: {
        defaultSrc: ["foo"],
      },
    });
    contentSecurityPolicy({
      useDefaults: false,
      directives: {
        "default-src": ["foo"],
      },
    });
    contentSecurityPolicy({
      useDefaults: false,
      directives: {
        defaultSrc: [],
      },
    });
    contentSecurityPolicy({
      useDefaults: false,
      directives: {
        defaultSrc: "",
      },
    });
  });

  it("allows default-src to be explicitly disabled", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            defaultSrc: dangerouslyDisableDefaultSrc,
            scriptSrc: ["example.com"],
          },
        },
      ],
      expectedDirectives: new Set(["script-src example.com"]),
    });

    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: false,
          directives: {
            "default-src": dangerouslyDisableDefaultSrc,
            "script-src": ["example.com"],
          },
        },
      ],
      expectedDirectives: new Set(["script-src example.com"]),
    });

    await checkCsp({
      middlewareArgs: [
        {
          useDefaults: true,
          directives: {
            "default-src": dangerouslyDisableDefaultSrc,
          },
        },
      ],
      expectedDirectives: new Set([
        "base-uri 'self'",
        "font-src 'self' https: data:",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "img-src 'self' data:",
        "object-src 'none'",
        "script-src 'self'",
        "script-src-attr 'none'",
        "style-src 'self' https: 'unsafe-inline'",
        "upgrade-insecure-requests",
      ]),
    });
  });

  it("throws an error if default-src is disabled and there are no other directives", () => {
    assert.throws(
      () => {
        contentSecurityPolicy({
          useDefaults: false,
          directives: {
            defaultSrc: dangerouslyDisableDefaultSrc,
          },
        });
      },
      {
        message:
          /^Content-Security-Policy has no directives. Either set some or disable the header$/,
      },
    );

    assert.throws(
      () => {
        contentSecurityPolicy({
          useDefaults: false,
          directives: {
            "default-src": dangerouslyDisableDefaultSrc,
          },
        });
      },
      {
        message:
          /^Content-Security-Policy has no directives. Either set some or disable the header$/,
      },
    );
  });

  it("throws an error if directives other than default-src are `dangerouslyDisableDefaultSrc`", () => {
    assert.throws(
      () => {
        contentSecurityPolicy({
          directives: {
            "default-src": "'self'",
            "script-src": dangerouslyDisableDefaultSrc,
          },
        });
      },
      {
        message:
          /^Content-Security-Policy: tried to disable "script-src" as if it were default-src; simply omit the key$/,
      },
    );
  });
});

describe("getDefaultDirectives", () => {
  it("returns the middleware's default directives", () => {
    assert.deepEqual(getDefaultDirectives(), {
      "base-uri": ["'self'"],
      "default-src": ["'self'"],
      "font-src": ["'self'", "https:", "data:"],
      "form-action": ["'self'"],
      "frame-ancestors": ["'self'"],
      "img-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "script-src": ["'self'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
      "upgrade-insecure-requests": [],
    });
  });

  it("attaches itself to the top-level function", () => {
    assert.equal(
      getDefaultDirectives,
      contentSecurityPolicy.getDefaultDirectives,
    );
  });

  it("returns a new copy each time", () => {
    const one = getDefaultDirectives();
    one["worker-src"] = ["ignored.example"];
    (one["img-src"] as Array<string>).push("ignored.example");

    const two = getDefaultDirectives();
    assert(!("worker-src" in two));
    assert(
      two["img-src"] && !Array.from(two["img-src"]).includes("ignored.example"),
    );
  });
});
