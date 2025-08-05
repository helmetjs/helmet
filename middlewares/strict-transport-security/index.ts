import type { IncomingMessage, ServerResponse } from "node:http";

const DEFAULT_MAX_AGE = 365 * 24 * 60 * 60;

/**
 * Options for configuring the `Strict-Transport-Security` header.
 */
export interface StrictTransportSecurityOptions {
  /**
   * Specifies the max-age directive in seconds.
   * Must be a positive integer.
   */
  maxAge?: number;

  /**
   * Whether to include subdomains in the policy.
   * Defaults to true.
   */
  includeSubDomains?: boolean;

  /**
   * Whether to add the preload directive.
   */
  preload?: boolean;
}

/**
 * Parses and validates the `maxAge` value, ensuring it is a positive integer.
 * Throws an error if the value is invalid.
 *
 * @param value - The maxAge value to parse.
 * @returns The validated maxAge value as an integer.
 */
function parseMaxAge(value: number = DEFAULT_MAX_AGE): number {
  if (value >= 0 && Number.isFinite(value)) {
    return Math.floor(value);
  } else {
    throw new Error(
      `Strict-Transport-Security: ${JSON.stringify(
        value,
      )} is not a valid value for maxAge. Please choose a positive integer.`,
    );
  }
}

/**
 * Generates the `Strict-Transport-Security` header value string based on options.
 * Validates option property names and constructs the directive list accordingly.
 *
 * @param options - The options to configure the header.
 * @returns The formatted header value string.
 */
function getHeaderValueFromOptions(
  options: Readonly<StrictTransportSecurityOptions>,
): string {
  if ("maxage" in options) {
    throw new Error(
      "Strict-Transport-Security received an unsupported property, `maxage`. Did you mean to pass `maxAge`?",
    );
  }
  if ("includeSubdomains" in options) {
    throw new Error(
      'Strict-Transport-Security middleware should use `includeSubDomains` instead of `includeSubdomains`. (The correct one has an uppercase "D".)',
    );
  }

  const directives: string[] = [`max-age=${parseMaxAge(options.maxAge)}`];

  if (options.includeSubDomains === undefined || options.includeSubDomains) {
    directives.push("includeSubDomains");
  }

  if (options.preload) {
    directives.push("preload");
  }

  return directives.join("; ");
}

/**
 * Returns middleware that sets the `Strict-Transport-Security` header.
 *
 * The middleware constructs the header value from the provided options,
 * sets it on the response, and then calls `next()` to continue.
 *
 * @param options - Configuration options for the header.
 * @returns Middleware function that sets the `Strict-Transport-Security` header.
 */
function strictTransportSecurity(
  options: Readonly<StrictTransportSecurityOptions> = {},
) {
  const headerValue = getHeaderValueFromOptions(options);

  return function strictTransportSecurityMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    res.setHeader("Strict-Transport-Security", headerValue);
    next();
  };
}

export default strictTransportSecurity;
