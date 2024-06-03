import { check } from "./helpers";
import strictTransportSecurity from "../middlewares/strict-transport-security";

describe("Strict-Transport-Security middleware", () => {
  it('by default, sets max-age to 180 days and adds "includeSubDomains"', async () => {
    expect(31536000).toStrictEqual(365 * 24 * 60 * 60);

    const expectedHeaders = {
      "strict-transport-security": "max-age=31536000; includeSubDomains",
    };

    await check(strictTransportSecurity(), expectedHeaders);
    await check(strictTransportSecurity({}), expectedHeaders);
    await check(strictTransportSecurity(Object.create(null)), expectedHeaders);
    await check(
      strictTransportSecurity({ maxAge: undefined }),
      expectedHeaders,
    );
    await check(
      strictTransportSecurity({ includeSubDomains: undefined }),
      expectedHeaders,
    );
  });

  it("sets the max-age to a non-negative integer", async () => {
    await check(strictTransportSecurity({ maxAge: 1234 }), {
      "strict-transport-security": "max-age=1234; includeSubDomains",
    });
    await check(strictTransportSecurity({ maxAge: 0 }), {
      "strict-transport-security": "max-age=0; includeSubDomains",
    });
    await check(strictTransportSecurity({ maxAge: -0 }), {
      "strict-transport-security": "max-age=0; includeSubDomains",
    });
  });

  it("rounds non-integer max-ages down", async () => {
    await check(strictTransportSecurity({ maxAge: 123.4 }), {
      "strict-transport-security": "max-age=123; includeSubDomains",
    });
    await check(strictTransportSecurity({ maxAge: 123.5 }), {
      "strict-transport-security": "max-age=123; includeSubDomains",
    });
  });

  it("disables subdomains with the includeSubDomains option", async () => {
    await check(strictTransportSecurity({ includeSubDomains: false }), {
      "strict-transport-security": "max-age=31536000",
    });
  });

  it("can enable preloading", async () => {
    await check(strictTransportSecurity({ preload: true }), {
      "strict-transport-security":
        "max-age=31536000; includeSubDomains; preload",
    });
  });

  it("can explicitly disable preloading", async () => {
    await check(strictTransportSecurity({ preload: false }), {
      "strict-transport-security": "max-age=31536000; includeSubDomains",
    });
  });

  it("throws an error with invalid parameters", () => {
    expect(() => strictTransportSecurity({ maxAge: -123 })).toThrow();
    expect(() =>
      strictTransportSecurity({ maxAge: BigInt(-123) as any }),
    ).toThrow();
    expect(() => strictTransportSecurity({ maxAge: -0.1 })).toThrow();
    expect(() => strictTransportSecurity({ maxAge: Infinity })).toThrow();
    expect(() => strictTransportSecurity({ maxAge: -Infinity })).toThrow();
    expect(() => strictTransportSecurity({ maxAge: NaN })).toThrow();

    expect(() => strictTransportSecurity({ maxAge: "123" } as any)).toThrow();
    expect(() =>
      strictTransportSecurity({ maxAge: BigInt(123) } as any),
    ).toThrow();
    expect(() => strictTransportSecurity({ maxAge: true } as any)).toThrow();
    expect(() => strictTransportSecurity({ maxAge: false } as any)).toThrow();
    expect(() => strictTransportSecurity({ maxAge: {} } as any)).toThrow();
    expect(() => strictTransportSecurity({ maxAge: [] } as any)).toThrow();
    expect(() => strictTransportSecurity({ maxAge: null } as any)).toThrow();

    expect(() => strictTransportSecurity({ maxage: false } as any)).toThrow();
    expect(() => strictTransportSecurity({ maxage: 1234 } as any)).toThrow();
  });

  it("logs a warning when using the mis-capitalized `includeSubdomains` parameter", () => {
    expect(() =>
      strictTransportSecurity({ includeSubdomains: false } as any),
    ).toThrow(
      'Strict-Transport-Security middleware should use `includeSubDomains` instead of `includeSubdomains`. (The correct one has an uppercase "D".)',
    );
  });
});
