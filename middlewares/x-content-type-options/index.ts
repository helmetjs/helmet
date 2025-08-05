import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Returns middleware that sets the `X-Content-Type-Options` header to `"nosniff"`.
 *
 * This header prevents browsers from MIME-sniffing a response away from the declared content-type.
 * The middleware sets the header and then calls `next()` to proceed.
 *
 * @returns Middleware function that sets the `X-Content-Type-Options` header.
 */
function xContentTypeOptions() {
  return function xContentTypeOptionsMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  };
}

export default xContentTypeOptions;
