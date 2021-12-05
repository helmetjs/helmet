import { IncomingMessage, ServerResponse } from "http";

function xXssProtection() {
  return function xXssProtectionMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("X-XSS-Protection", "0");
    next();
  };
}

export default xXssProtection;
