import { IncomingMessage, ServerResponse } from "http";

export interface ExpectCtOptions {
  maxAge?: number;
  enforce?: boolean;
  reportUri?: string;
}

function parseMaxAge(value: void | number): number {
  if (value === undefined) {
    return 0;
  } else if (typeof value === "number" && value >= 0) {
    return Math.floor(value);
  } else {
    throw new Error(
      `${value} is not a valid value for maxAge. Please choose a positive integer.`
    );
  }
}

function getHeaderValueFromOptions(options: Readonly<ExpectCtOptions>): string {
  const directives: string[] = [];

  directives.push(`max-age=${parseMaxAge(options.maxAge)}`);

  if (options.enforce) {
    directives.push("enforce");
  }

  if (options.reportUri) {
    directives.push(`report-uri="${options.reportUri}"`);
  }

  return directives.join(", ");
}

function expectCt(options: Readonly<ExpectCtOptions> = {}) {
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
