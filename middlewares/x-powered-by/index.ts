import { IncomingMessage, ServerResponse } from "http";

function xPoweredByMiddleware(
  _req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) {
  res.removeHeader("X-Powered-By");
  next();
}

function xPoweredBy() {
  return xPoweredByMiddleware;
}

module.exports = xPoweredBy;
export default xPoweredBy;
