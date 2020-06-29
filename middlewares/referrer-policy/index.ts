import { IncomingMessage, ServerResponse } from "http";

export interface ReferrerPolicyOptions {
  policy?: string | string[];
}

function getHeaderValueFromOptions(
  options: Readonly<ReferrerPolicyOptions>
): string {
  const DEFAULT_POLICY = "no-referrer";
  const ALLOWED_POLICIES: string[] = [
    "no-referrer",
    "no-referrer-when-downgrade",
    "same-origin",
    "origin",
    "strict-origin",
    "origin-when-cross-origin",
    "strict-origin-when-cross-origin",
    "unsafe-url",
    "",
  ];

  let policyOption: unknown;
  if (options.policy === undefined) {
    policyOption = DEFAULT_POLICY;
  } else {
    policyOption = options.policy;
  }

  const policies: unknown[] = Array.isArray(policyOption)
    ? policyOption
    : [policyOption];

  if (policies.length === 0) {
    throw new Error("At least one policy must be supplied.");
  }

  const policiesSeen: Set<string> = new Set();
  policies.forEach((policy) => {
    if (typeof policy !== "string" || ALLOWED_POLICIES.indexOf(policy) === -1) {
      const allowedPoliciesErrorList = ALLOWED_POLICIES.map((policy) => {
        if (policy.length) {
          return `"${policy}"`;
        } else {
          return "and the empty string";
        }
      }).join(", ");
      throw new Error(
        `"${policy}" is not a valid policy. Allowed policies: ${allowedPoliciesErrorList}.`
      );
    }

    if (policiesSeen.has(policy)) {
      throw new Error(
        `"${policy}" specified more than once. No duplicates are allowed.`
      );
    }
    policiesSeen.add(policy);
  });

  return policies.join(",");
}

function referrerPolicy(options: Readonly<ReferrerPolicyOptions> = {}) {
  const headerValue = getHeaderValueFromOptions(options);

  return function referrerPolicyMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("Referrer-Policy", headerValue);
    next();
  };
}

module.exports = referrerPolicy;
export default referrerPolicy;
