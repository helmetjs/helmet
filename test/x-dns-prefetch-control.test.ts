import xDnsPrefetchControl from "../middlewares/x-dns-prefetch-control";
import { check } from "./helpers";

describe("X-DNS-Prefetch-Control middleware", () => {
  it('sets the header to "off" by default', async () => {
    const expectedHeaders = { "x-dns-prefetch-control": "off" };

    await check(xDnsPrefetchControl(), expectedHeaders);
    await check(xDnsPrefetchControl({}), expectedHeaders);
    await check(xDnsPrefetchControl(Object.create(null)), expectedHeaders);
  });

  it('can set header to "off" with configuration', async () => {
    await check(xDnsPrefetchControl({ allow: false }), {
      "x-dns-prefetch-control": "off",
    });
  });

  it('can set header to "on" with configuration', async () => {
    await check(xDnsPrefetchControl({ allow: true }), {
      "x-dns-prefetch-control": "on",
    });
  });
});
