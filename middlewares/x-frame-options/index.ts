import type { IncomingMessage, ServerResponse } from "node:http";

// Middleware to set the X-Frame-Options header
// Used to reduce clickjacking risks in browsers that do not support CSP
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options

// Accepts only standardized values (RFC 7034): "DENY" and "SAMEORIGIN"
// Default value: "SAMEORIGIN". The legacy "ALLOW-FROM" option is not supported
// https://datatracker.ietf.org/doc/html/rfc7034
export interface XFrameOptionsOptions {
  action?: "deny" | "sameorigin";
}

// Normalizes and validates the X-Frame-Options header value.
// Converts to uppercase (tolerates different casing)
// Accepts only safe values: "DENY" or "SAMEORIGIN"
// Supports "SAME-ORIGIN" for backward compatibility with legacy configurations
// Throws an error if the value is invalid, preventing insecure configuration
function getHeaderValueFromOptions({
  action = "sameorigin",
}: Readonly<XFrameOptionsOptions>): string {
  const normalizedAction =
    typeof action === "string" ? action.toUpperCase() : action;

  switch (normalizedAction) {
    case "SAME-ORIGIN": // legacy format support
      return "SAMEORIGIN";
    case "DENY":
    case "SAMEORIGIN":
      return normalizedAction;
    default:
      throw new Error(
        `X-Frame-Options received an invalid action ${JSON.stringify(action)}`,
      );
  }
}

// Middleware that sets the X-Frame-Options header in HTTP responses.
// Returns a function in Express/Connect middleware format.
function xFrameOptions(options: Readonly<XFrameOptionsOptions> = {}) {
  const headerValue = getHeaderValueFromOptions(options);

  return function xFrameOptionsMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    res.setHeader("X-Frame-Options", headerValue);
    next();
  };
}

export default xFrameOptions;
