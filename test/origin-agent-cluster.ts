import { check } from "./helpers";
import originAgentCluster from "../middlewares/origin-agent-cluster";

describe("Origin-Agent-Cluster middleware", () => {
  it('sets "Origin-Agent-Cluster: ?1"', async () => {
    await check(originAgentCluster(), {
      "origin-agent-cluster": "?1",
    });
  });
});
