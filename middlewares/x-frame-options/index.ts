import { IncomingMessage, ServerResponse } from "http";

export interface XFrameOptionsOptions {
  action?: string;
}

function getHeaderValueFromOptions({
  action = "SAMEORIGIN",
}: Readonly<XFrameOptionsOptions>): string {
  const normalizedAction =
    typeof action === "string" ? action.toUpperCase() : action;

  if (normalizedAction === "SAME-ORIGIN") {
    return "SAMEORIGIN";
  } else if (normalizedAction === "DENY" || normalizedAction === "SAMEORIGIN") {
    return normalizedAction;
  } else if (normalizedAction === "ALLOW-FROM") {
    throw new Error(
      "X-Frame-Options no longer supports `ALLOW-FROM` due to poor browser support. See <https://github.com/helmetjs/helmet/wiki/How-to-use-X%E2%80%93Frame%E2%80%93Options's-%60ALLOW%E2%80%93FROM%60-directive> for more info."
    );
  } else {
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

module.exports = xFrameOptions;
export default xFrameOptions;
