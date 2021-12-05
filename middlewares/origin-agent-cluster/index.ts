import { IncomingMessage, ServerResponse } from "http";

function originAgentCluster() {
  return function originAgentClusterMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ): void {
    res.setHeader("Origin-Agent-Cluster", "?1");
    next();
  };
}

export default originAgentCluster;
