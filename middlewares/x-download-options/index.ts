import { IncomingMessage, ServerResponse } from "http";

function xDownloadOptionsMiddleware(
  _req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): void {
  res.setHeader("X-Download-Options", "noopen");
  next();
}

function xDownloadOptions() {
  return xDownloadOptionsMiddleware;
}

module.exports = xDownloadOptions;
export default xDownloadOptions;
