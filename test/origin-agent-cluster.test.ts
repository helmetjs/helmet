import { describe, it } from "node:test";
import originAgentCluster from "../middlewares/origin-agent-cluster";
import { check } from "./helpers";

describe("Origin-Agent-Cluster middleware", () => {
  it('sets "Origin-Agent-Cluster: ?1"', async () => {
    await check(originAgentCluster(), {
      "origin-agent-cluster": "?1",
    });
  });
});
