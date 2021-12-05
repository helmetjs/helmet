import { IncomingMessage, ServerResponse } from "http";

export interface XDnsPrefetchControlOptions {
  allow?: boolean;
}

function xDnsPrefetchControl(
  options: Readonly<XDnsPrefetchControlOptions> = {}
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

export default xDnsPrefetchControl;
