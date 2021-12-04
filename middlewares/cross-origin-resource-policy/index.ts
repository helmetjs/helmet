import { IncomingMessage, ServerResponse } from "http";

export interface CrossOriginResourcePolicyOptions {
  policy?: string;
}

const ALLOWED_POLICIES = new Set(["same-origin", "same-site", "cross-origin"]);

function getHeaderValueFromOptions({
  policy = "same-origin",
}: Readonly<CrossOriginResourcePolicyOptions>): string {
  if (ALLOWED_POLICIES.has(policy)) {
    return policy;
  } else {
    throw new Error(
      `Cross-Origin-Resource-Policy does not support the ${JSON.stringify(
        policy
      )} policy`
    );
  }
}

function crossOriginResourcePolicy(
  options: Readonly<CrossOriginResourcePolicyOptions> = {}
) {
  const headerValue = getHeaderValueFromOptions(options);

  return function crossOriginResourcePolicyMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("Cross-Origin-Resource-Policy", headerValue);
    next();
  };
}

export default crossOriginResourcePolicy;
