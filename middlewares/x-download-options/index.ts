import { IncomingMessage, ServerResponse } from "http";

function xDownloadOptions() {
  return function xDownloadOptionsMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): void {
    res.setHeader("X-Download-Options", "noopen");
    next();
  };
}

export default xDownloadOptions;
