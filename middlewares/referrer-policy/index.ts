import type { IncomingMessage, ServerResponse } from "node:http";

type ReferrerPolicyToken =
  | "no-referrer"
  | "no-referrer-when-downgrade"
  | "same-origin"
  | "origin"
  | "strict-origin"
  | "origin-when-cross-origin"
  | "strict-origin-when-cross-origin"
  | "unsafe-url"
  | "";

export interface ReferrerPolicyOptions {
  /**
   * One or more valid Referrer-Policy tokens.
   * Can be a string or an array of strings.
   * Defaults to `["no-referrer"]`.
   */
  policy?: ReferrerPolicyToken | ReferrerPolicyToken[];
}

const ALLOWED_TOKENS = new Set<ReferrerPolicyToken>([
  "no-referrer",
  "no-referrer-when-downgrade",
  "same-origin",
  "origin",
  "strict-origin",
  "origin-when-cross-origin",
  "strict-origin-when-cross-origin",
  "unsafe-url",
  "",
]);

/**
 * Validates and normalizes the `policy` option.
 * Throws on invalid or duplicate tokens.
 *
 * @param options The ReferrerPolicyOptions object.
 * @returns The normalized header value string.
 */
function getHeaderValueFromOptions({
  policy = ["no-referrer"],
}: Readonly<ReferrerPolicyOptions>): string {
  const tokens = typeof policy === "string" ? [policy] : policy;

  if (tokens.length === 0) {
    throw new Error("Referrer-Policy received no policy tokens");
  }

  const tokensSeen = new Set<ReferrerPolicyToken>();
  tokens.forEach((token) => {
    if (!ALLOWED_TOKENS.has(token)) {
      throw new Error(
        `Referrer-Policy received an unexpected policy token ${JSON.stringify(
          token,
        )}`,
      );
    } else if (tokensSeen.has(token)) {
      throw new Error(
        `Referrer-Policy received a duplicate policy token ${JSON.stringify(
          token,
        )}`,
      );
    }
    tokensSeen.add(token);
  });

  return tokens.join(",");
}

/**
 * Middleware factory to set the `Referrer-Policy` header.
 *
 * The middleware sets the header with the validated value from options
 * and calls `next()` to continue request processing.
 *
 * @param options Configuration options for the Referrer-Policy header.
 * @returns Middleware function that sets the `Referrer-Policy` header.
 */
function referrerPolicy(options: Readonly<ReferrerPolicyOptions> = {}) {
  const headerValue = getHeaderValueFromOptions(options);

  return function referrerPolicyMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    res.setHeader("Referrer-Policy", headerValue);
    next();
  };
}

export default referrerPolicy;
