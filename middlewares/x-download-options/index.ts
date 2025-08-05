import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Returns middleware that sets the `X-Download-Options` header to `"noopen"`.
 *
 * The middleware sets this header on the response to instruct browsers
 * to disable automatic opening of downloaded files.
 * It then calls `next()` to continue the middleware chain.
 *
 * @returns Middleware function that sets the `X-Download-Options` header.
 */
function xDownloadOptions() {
  return function xDownloadOptionsMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ): void {
    res.setHeader("X-Download-Options", "noopen");
    next();
  };
}

export default xDownloadOptions;
