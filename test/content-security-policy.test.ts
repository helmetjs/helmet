import { IncomingMessage, ServerResponse } from "http";
import { check } from "./helpers";
import connect = require("connect");
import supertest = require("supertest");
import contentSecurityPolicy, {
  getDefaultDirectives,
} from "../middlewares/content-security-policy";

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
  expect(header).toHaveProperty(expectedHeader);

  const actualDirectives = header[expectedHeader].split(";");
  const actualDirectivesSet = new Set(actualDirectives);
  expect(actualDirectives).toHaveLength(actualDirectivesSet.size);

  expect(actualDirectivesSet).toEqual(expectedDirectives);
}

describe("Content-Security-Policy middleware", () => {
  it("sets a default policy when passed no directives", async () => {
    const expectedDirectives = new Set([
      "default-src 'self'",
      "base-uri 'self'",
      "block-all-mixed-content",
      "font-src 'self' https: data:",
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
  });

  it("sets directives when named with snake-case", async () => {
    await checkCsp({
      middlewareArgs: [
        {
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

  it("allows functions in directive values to generate dynamic directives", async () => {
    await checkCsp({
      middlewareArgs: [
        {
          directives: {
            "default-src": [
              "'self'",
              (req: IncomingMessage, res: ServerResponse) => {
                expect(req).toBeInstanceOf(IncomingMessage);
                expect(res).toBeInstanceOf(ServerResponse);
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

  it('can set the "report only" version of the header instead', async () => {
    await checkCsp({
      middlewareArgs: [
        {
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
      "á",
      "default src",
      "default;src",
      "default,src",
      "default!src",
      "defáult-src",
    ];
    for (const name of invalidNames) {
      expect(() => {
        contentSecurityPolicy({
          directives: {
            "default-src": "'self'",
            [name]: ["value"],
          },
        });
      }).toThrow(
        /^Content-Security-Policy received an invalid directive name "/
      );
    }
  });

  it("throws if duplicate directive names are found", () => {
    expect(() => {
      contentSecurityPolicy({
        directives: {
          defaultSrc: ["foo"],
          "default-src": ["foo"],
        },
      });
    }).toThrow(
      /^Content-Security-Policy received a duplicate directive "default-src"$/
    );

    expect(() => {
      contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["foo"],
          "script-src": ["foo"],
        },
      });
    }).toThrow(
      /^Content-Security-Policy received a duplicate directive "script-src"$/
    );
  });

  it("throws if any directive values are invalid", () => {
    const invalidValues = [";", ",", "hello;world", "hello,world"];
    for (const invalidValue of invalidValues) {
      expect(() => {
        contentSecurityPolicy({
          directives: {
            "default-src": "'self'",
            "something-else": [invalidValue],
          },
        });
      }).toThrow(
        /^Content-Security-Policy received an invalid directive value for "something-else"$/
      );
    }
  });

  it("errors if any directive values are invalid when a function returns", async () => {
    const app = connect()
      .use(
        contentSecurityPolicy({
          directives: {
            defaultSrc: ["'self'", () => "bad;value"],
          },
        })
      )
      .use(
        (
          err: Error,
          _req: IncomingMessage,
          res: ServerResponse,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _next: () => void
        ) => {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: err.message }));
        }
      );

    await supertest(app).get("/").expect(500, {
      message:
        'Content-Security-Policy received an invalid directive value for "default-src"',
    });
  });

  it("throws if default-src is missing", () => {
    expect(() => {
      contentSecurityPolicy({
        directives: {},
      });
    }).toThrow(
      /^Content-Security-Policy needs a default-src but none was provided$/
    );
    expect(() => {
      contentSecurityPolicy({
        directives: {
          scriptSrc: ["example.com"],
        },
      });
    }).toThrow(
      /^Content-Security-Policy needs a default-src but none was provided$/
    );

    expect(() => {
      contentSecurityPolicy({
        directives: {
          defaultSrc: ["foo"],
        },
      });
    }).not.toThrow();
    expect(() => {
      contentSecurityPolicy({
        directives: {
          "default-src": ["foo"],
        },
      });
    }).not.toThrow();
    expect(() => {
      contentSecurityPolicy({
        directives: {
          defaultSrc: [],
        },
      });
    }).not.toThrow();
    expect(() => {
      contentSecurityPolicy({
        directives: {
          defaultSrc: "",
        },
      });
    }).not.toThrow();
  });

  // This functionality only exists to ease the transition to this major version.
  // It's safe to remove these warnings (and therefore these tests) without a
  // breaking change.
  describe("warnings for legacy usage", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    it("logs a warning when using the `loose` parameter", () => {
      contentSecurityPolicy({
        directives: {
          "default-src": ["foo"],
        },
        loose: true,
      } as any);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "Content-Security-Policy middleware no longer needs the `loose` parameter. You should remove it."
      );
    });

    it("logs a warning when using the `setAllHeaders` parameter", () => {
      contentSecurityPolicy({
        directives: {
          "default-src": ["foo"],
        },
        setAllHeaders: false,
      } as any);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "Content-Security-Policy middleware no longer supports the `setAllHeaders` parameter. See <https://github.com/helmetjs/helmet/wiki/Setting-legacy-Content-Security-Policy-headers-in-Helmet-4>."
      );
    });

    it("logs a warning when using the `disableAndroid` parameter", () => {
      contentSecurityPolicy({
        directives: {
          "default-src": ["foo"],
        },
        disableAndroid: false,
      } as any);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "Content-Security-Policy middleware no longer does browser sniffing, so you can remove the `disableAndroid` option. See <https://github.com/helmetjs/csp/issues/97> for discussion."
      );
    });

    it("logs a warning when using the `browserSniff` parameter", () => {
      contentSecurityPolicy({
        directives: {
          "default-src": ["foo"],
        },
        browserSniff: false,
      } as any);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith(
        "Content-Security-Policy middleware no longer does browser sniffing, so you can remove the `browserSniff` option. See <https://github.com/helmetjs/csp/issues/97> for discussion."
      );
    });
  });
});

describe("getDefaultDirectives", () => {
  it("returns the middleware's default directives", () => {
    expect(getDefaultDirectives()).toEqual({
      "base-uri": ["'self'"],
      "block-all-mixed-content": [],
      "default-src": ["'self'"],
      "font-src": ["'self'", "https:", "data:"],
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
    expect(getDefaultDirectives).toBe(
      contentSecurityPolicy.getDefaultDirectives
    );
  });
});
