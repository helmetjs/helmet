import { IncomingMessage, ServerResponse } from "http";

function xPoweredBy() {
  return function xPoweredByMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.removeHeader("X-Powered-By");
    next();
  };
}

export default xPoweredBy;
