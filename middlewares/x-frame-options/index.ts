import { IncomingMessage, ServerResponse } from "http";

export interface XFrameOptionsOptions {
  // This offers autocomplete while still supporting regular `string`s.
  action?: "DENY" | "SAMEORIGIN" | (string & { _?: never });
}

function getHeaderValueFromOptions({
  action = "SAMEORIGIN",
}: Readonly<XFrameOptionsOptions>): string {
  const normalizedAction =
    typeof action === "string" ? action.toUpperCase() : action;

  switch (normalizedAction) {
    case "SAME-ORIGIN":
      return "SAMEORIGIN";
    case "DENY":
    case "SAMEORIGIN":
      return normalizedAction;
    case "ALLOW-FROM":
      throw new Error(
        "X-Frame-Options no longer supports `ALLOW-FROM` due to poor browser support. See <https://github.com/helmetjs/helmet/wiki/How-to-use-X%E2%80%93Frame%E2%80%93Options's-%60ALLOW%E2%80%93FROM%60-directive> for more info."
      );
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
