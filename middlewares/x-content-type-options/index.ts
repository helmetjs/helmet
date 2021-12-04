import { IncomingMessage, ServerResponse } from "http";

function xContentTypeOptions() {
  return function xContentTypeOptionsMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  };
}

export default xContentTypeOptions;
