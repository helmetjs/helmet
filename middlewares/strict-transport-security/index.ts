import { IncomingMessage, ServerResponse } from "http";

declare module strictTransportSecurity {
  export interface Options {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  }
}

const DEFAULT_MAX_AGE = 180 * 24 * 60 * 60;

function parseMaxAge(value: void | number): number {
  if (value === undefined) {
    return DEFAULT_MAX_AGE;
  } else if (
    typeof value === "number" &&
    value >= 0 &&
    Number.isFinite(value)
  ) {
    return Math.floor(value);
  } else {
    throw new Error(
      `Strict-Transport-Security: ${JSON.stringify(
        value
      )} is not a valid value for maxAge. Please choose a positive integer.`
    );
  }
}

function getHeaderValueFromOptions(
  options: Readonly<strictTransportSecurity.Options>
): string {
  if ("maxage" in options) {
    throw new Error(
      "Strict-Transport-Security received an unsupported property, `maxage`. Did you mean to pass `maxAge`?"
    );
  }
  if ("includeSubdomains" in options) {
    console.warn(
      'Strict-Transport-Security middleware should use `includeSubDomains` instead of `includeSubdomains`. (The correct one has an uppercase "D".)'
    );
  }
  if ("setIf" in options) {
    console.warn(
      "Strict-Transport-Security middleware no longer supports the `setIf` parameter. See the documentation and <https://github.com/helmetjs/helmet/wiki/Conditionally-using-middleware> if you need help replicating this behavior."
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

function strictTransportSecurity(
  options: Readonly<strictTransportSecurity.Options> = {}
) {
  const headerValue = getHeaderValueFromOptions(options);

  return function strictTransportSecurityMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("Strict-Transport-Security", headerValue);
    next();
  };
}

module.exports = strictTransportSecurity;
export default strictTransportSecurity;
