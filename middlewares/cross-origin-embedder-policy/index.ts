import { IncomingMessage, ServerResponse } from "http";

function crossOriginEmbedderPolicy() {
  return function crossOriginEmbedderPolicyMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): void {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
  };
}

export default crossOriginEmbedderPolicy;
