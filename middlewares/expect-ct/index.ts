import { IncomingMessage, ServerResponse } from "http";

declare module expectCt {
  export interface Options {
    maxAge?: number;
    enforce?: boolean;
    reportUri?: string;
  }
}

function parseMaxAge(value: void | number): number {
  if (value === undefined) {
    return 0;
  } else if (
    typeof value === "number" &&
    value >= 0 &&
    Number.isFinite(value)
  ) {
    return Math.floor(value);
  } else {
    throw new Error(
      `Expect-CT: ${JSON.stringify(
        value
      )} is not a valid value for maxAge. Please choose a positive integer.`
    );
  }
}

function getHeaderValueFromOptions(
  options: Readonly<expectCt.Options>
): string {
  const directives: string[] = [];

  if (options.enforce) {
    directives.push("enforce");
  }

  directives.push(`max-age=${parseMaxAge(options.maxAge)}`);

  if (options.reportUri) {
    directives.push(`report-uri="${options.reportUri}"`);
  }

  return directives.join(", ");
}

function expectCt(options: Readonly<expectCt.Options> = {}) {
  const headerValue = getHeaderValueFromOptions(options);

  return function expectCtMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("Expect-CT", headerValue);
    next();
  };
}

module.exports = expectCt;
export default expectCt;
