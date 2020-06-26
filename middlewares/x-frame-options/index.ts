import { IncomingMessage, ServerResponse } from "http";

export interface XFrameOptionsOptions {
  action?: string;
  domain?: string;
}

function parseActionOption(actionOption: unknown): string {
  const invalidActionErr = new Error(
    'action must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN".'
  );

  if (actionOption === undefined) {
    actionOption = "SAMEORIGIN";
  } else if (actionOption instanceof String) {
    actionOption = actionOption.valueOf();
  }

  let result: string;
  if (typeof actionOption === "string") {
    result = actionOption.toUpperCase();
  } else {
    throw invalidActionErr;
  }

  if (result === "ALLOWFROM") {
    result = "ALLOW-FROM";
  } else if (result === "SAME-ORIGIN") {
    result = "SAMEORIGIN";
  }

  if (["DENY", "ALLOW-FROM", "SAMEORIGIN"].indexOf(result) === -1) {
    throw invalidActionErr;
  }

  return result;
}

function parseDomainOption(domainOption: unknown): string {
  if (domainOption instanceof String) {
    domainOption = domainOption.valueOf();
  }

  if (typeof domainOption !== "string") {
    throw new Error("ALLOW-FROM action requires a string domain parameter.");
  } else if (!domainOption.length) {
    throw new Error("domain parameter must not be empty.");
  }

  return domainOption;
}

function getHeaderValueFromOptions(
  options: Readonly<XFrameOptionsOptions>
): string {
  const action = parseActionOption(options.action);

  if (action === "ALLOW-FROM") {
    const domain = parseDomainOption(options.domain);
    return `${action} ${domain}`;
  } else {
    return action;
  }
}

function xFrameOptions(options: Readonly<XFrameOptionsOptions> = {}) {
  const headerValue = getHeaderValueFromOptions(options);

  return function xFrameOptionsMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("X-Frame-Options", headerValue);
    next();
  };
}

module.exports = xFrameOptions;
export default xFrameOptions;
