import { check } from "./helpers";
import xDnsPrefetchControl from "../middlewares/x-dns-prefetch-control";

describe("X-DNS-Prefetch-Control middleware", () => {
  it('sets the header to "off" by default', async () => {
    await check(xDnsPrefetchControl(), {
      "x-dns-prefetch-control": "off",
    });
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
