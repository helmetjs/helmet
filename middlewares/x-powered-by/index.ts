import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Middleware that removes the "X-Powered-By" response header.
 *
 * This function returns a middleware which, when invoked,
 * calls `res.removeHeader("X-Powered-By")` to ensure the header is not sent.
 * It then calls the `next` function to continue the middleware chain.
 *
 * @returns A middleware function for use in HTTP servers.
 */
function xPoweredBy() {
  return function xPoweredByMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    res.removeHeader("X-Powered-By");
    next();
  };
}

export default xPoweredBy;
