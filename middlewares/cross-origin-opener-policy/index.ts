import { IncomingMessage, ServerResponse } from "http";

export interface CrossOriginOpenerPolicyOptions {
  policy?: string;
}

const ALLOWED_POLICIES = new Set([
  "same-origin",
  "same-origin-allow-popups",
  "unsafe-none",
]);

function getHeaderValueFromOptions({
  policy = "same-origin",
}: Readonly<CrossOriginOpenerPolicyOptions>): string {
  if (ALLOWED_POLICIES.has(policy)) {
    return policy;
  } else {
    throw new Error(
      `Cross-Origin-Opener-Policy does not support the ${JSON.stringify(
        policy
      )} policy`
    );
  }
}

function crossOriginOpenerPolicy(
  options: Readonly<CrossOriginOpenerPolicyOptions> = {}
) {
  const headerValue = getHeaderValueFromOptions(options);

  return function crossOriginOpenerPolicyMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("Cross-Origin-Opener-Policy", headerValue);
    next();
  };
}

export default crossOriginOpenerPolicy;
