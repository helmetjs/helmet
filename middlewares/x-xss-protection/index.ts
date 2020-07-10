import { IncomingMessage, ServerResponse } from "http";

function xXssProtectionMiddleware(
  _req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  res.setHeader("X-XSS-Protection", "0");
  next();
}

function xXssProtection() {
  return xXssProtectionMiddleware;
}

module.exports = xXssProtection;
export default xXssProtection;
