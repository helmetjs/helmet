import type { IncomingMessage, ServerResponse } from "node:http";

function xXssProtection() {
  return function xXssProtectionMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    res.setHeader("X-XSS-Protection", "0");
    next();
  };
}

export default xXssProtection;
