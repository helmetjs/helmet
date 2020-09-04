import { IncomingMessage, ServerResponse } from "http";

declare module xDnsPrefetchControl {
  export interface Options {
    allow?: boolean;
  }
}

function xDnsPrefetchControl(
  options: Readonly<xDnsPrefetchControl.Options> = {}
) {
  const headerValue = options.allow ? "on" : "off";

  return function xDnsPrefetchControlMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): void {
    res.setHeader("X-DNS-Prefetch-Control", headerValue);
    next();
  };
}

module.exports = xDnsPrefetchControl;
export default xDnsPrefetchControl;
