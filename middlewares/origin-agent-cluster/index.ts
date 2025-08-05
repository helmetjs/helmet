import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Returns middleware that sets the `Origin-Agent-Cluster` header to `"?1"`.
 *
 * The middleware adds this header to the response and then calls `next()` 
 * to continue the middleware chain.
 *
 * @returns Middleware function that sets the `Origin-Agent-Cluster` header.
 */
function originAgentCluster() {
  return function originAgentClusterMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ): void {
    res.setHeader("Origin-Agent-Cluster", "?1");
    next();
  };
}

export default originAgentCluster;
