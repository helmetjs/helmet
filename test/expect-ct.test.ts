import { check } from "./helpers";
import expectCt from "../middlewares/expect-ct";

describe("Expect-CT middleware", () => {
  it("sets the max-age to 0 when passed no max-age", async () => {
    await check(expectCt(), {
      "expect-ct": "max-age=0",
    });
    await check(expectCt({}), {
      "expect-ct": "max-age=0",
    });
    await check(expectCt({ maxAge: undefined }), {
      "expect-ct": "max-age=0",
    });
  });

  it("sets the max-age to a provided integer", async () => {
    await check(expectCt({ maxAge: 123 }), {
      "expect-ct": "max-age=123",
    });
    await check(expectCt({ maxAge: 0 }), {
      "expect-ct": "max-age=0",
    });
  });

  it("rounds non-integers down", async () => {
    await check(expectCt({ maxAge: 123.4 }), {
      "expect-ct": "max-age=123",
    });
    await check(expectCt({ maxAge: 123.5 }), {
      "expect-ct": "max-age=123",
    });
  });

  it("rejects negative max-ages", async () => {
    expect(() => expectCt({ maxAge: -123 })).toThrow();
    expect(() => expectCt({ maxAge: -0.1 })).toThrow();
  });

  it("can enable enforcement", async () => {
    await check(expectCt({ enforce: true }), {
      "expect-ct": "enforce, max-age=0",
    });
  });

  it("can explicitly disable enforcement", async () => {
    await check(expectCt({ enforce: false }), {
      "expect-ct": "max-age=0",
    });
  });

  it("can set a report-uri", async () => {
    await check(expectCt({ reportUri: "https://example.com/report" }), {
      "expect-ct": 'max-age=0, report-uri="https://example.com/report"',
    });
  });

  it("can set enforcement, max-age, and a report-uri", async () => {
    await check(
      expectCt({
        enforce: true,
        maxAge: 123,
        reportUri: "https://example.com/report",
      }),
      {
        "expect-ct":
          'enforce, max-age=123, report-uri="https://example.com/report"',
      }
    );
  });
});
