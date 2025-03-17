import type { IncomingMessage, ServerResponse } from "node:http";

function xPoweredBy() {
  return function xPoweredByMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    res.removeHeader("X-Powered-By");
    next();
  };
}

export default xPoweredBy;
