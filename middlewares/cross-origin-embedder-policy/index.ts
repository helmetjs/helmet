import { IncomingMessage, ServerResponse } from "http";

export interface CrossOriginEmbedderPolicyOptions {
  policy?: "require-corp" | "credentialless";
}

const ALLOWED_POLICIES = new Set(["require-corp", "credentialless"]);

function getHeaderValueFromOptions({
  policy = "require-corp",
}: Readonly<CrossOriginEmbedderPolicyOptions>): string {
  if (ALLOWED_POLICIES.has(policy)) {
    return policy;
  } else {
    throw new Error(
      `Cross-Origin-Embedder-Policy does not support the ${JSON.stringify(
        policy
      )} policy`
    );
  }
}

function crossOriginEmbedderPolicy(
  options: Readonly<CrossOriginEmbedderPolicyOptions> = {}
) {
  const headerValue = getHeaderValueFromOptions(options);

  return function crossOriginEmbedderPolicyMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("Cross-Origin-Embedder-Policy", headerValue);
    next();
  };
}

export default crossOriginEmbedderPolicy;
