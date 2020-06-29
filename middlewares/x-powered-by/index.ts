import { IncomingMessage, ServerResponse } from "http";

export interface XPoweredByOptions {
  setTo?: string;
}

function getUpdaterFn(
  value: string | undefined
): (res: ServerResponse) => void {
  if (value) {
    return (res) => {
      res.setHeader("X-Powered-By", value);
    };
  } else {
    return (res) => {
      res.removeHeader("X-Powered-By");
    };
  }
}

function xPoweredBy(options: Readonly<XPoweredByOptions> = {}) {
  const updateResponse = getUpdaterFn(options.setTo);

  return function xPoweredByMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    updateResponse(res);
    next();
  };
}

module.exports = xPoweredBy;
export default xPoweredBy;
