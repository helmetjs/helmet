import { IncomingMessage, ServerResponse } from "http";

export interface XFrameOptionsOptions {
  action?: "deny" | "sameorigin";
}

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
        `X-Frame-Options received an invalid action ${JSON.stringify(action)}`
      );
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

export default xFrameOptions;
