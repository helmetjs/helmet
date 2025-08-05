import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Options for configuring the `X-DNS-Prefetch-Control` header.
 */
export interface XDnsPrefetchControlOptions {
  /**
   * Enables or disables DNS prefetching.
   * @default false
   */
  allow?: boolean;
}

/**
 * Returns middleware that sets the `X-DNS-Prefetch-Control` header.
 *
 * The header value is set to `"on"` if `allow` is true; otherwise, `"off"`.
 * The middleware sets this header on the response and passes control to the next middleware.
 *
 * @param options Configuration options.
 * @returns Middleware function that sets the `X-DNS-Prefetch-Control` header.
 */
function xDnsPrefetchControl(
  options: Readonly<XDnsPrefetchControlOptions> = {},
) {
  const headerValue = options.allow ? "on" : "off";

  return function xDnsPrefetchControlMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ): void {
    res.setHeader("X-DNS-Prefetch-Control", headerValue);
    next();
  };
}

export default xDnsPrefetchControl;
