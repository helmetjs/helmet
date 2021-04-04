import { check } from "./helpers";
import crossOriginEmbedderPolicy from "../middlewares/cross-origin-embedder-policy";

describe("Cross-Origin-Embedder-Policy middleware", () => {
  it('sets "Cross-Origin-Embedder-Policy: require-corp"', async () => {
    await check(crossOriginEmbedderPolicy(), {
      "cross-origin-embedder-policy": "require-corp",
    });
  });
});
