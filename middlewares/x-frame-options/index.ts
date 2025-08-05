import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Options for configuring the `X-Frame-Options` header.
 */
export interface XFrameOptionsOptions {
  /**
   * Controls whether the page can be displayed in a frame.
   * - `"deny"`: Prevents the page from being displayed in any frame.
   * - `"sameorigin"`: Allows the page to be displayed only in a frame on the same origin.
   * @default "sameorigin"
   */
  action?: "deny" | "sameorigin";
}

/**
 * Validates and normalizes the `action` value, returning the corresponding
 * `X-Frame-Options` header value.
 * @private
 */
function getHeaderValueFromOptions({
  action = "sameorigin",
}: Readonly<XFrameOptionsOptions>): string {
  const normalizedAction =
    typeof action === "string" ? action.toUpperCase() : action;

  switch (normalizedAction) {
    case "SAME-ORIGIN":
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

/**
 * Middleware to set the `X-Frame-Options` header.
 *
 * This header helps mitigate clickjacking attacks by controlling whether
 * the current page can be embedded in a frame or iframe.
 *
 * @param {XFrameOptionsOptions} [options] Configuration object for the header.
 * @returns A middleware function that sets the `X-Frame-Options` header.
 */
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
