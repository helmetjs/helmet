import { IncomingMessage, ServerResponse } from "http";

export interface XPermittedCrossDomainPoliciesOptions {
  permittedPolicies?: string;
}

const ALLOWED_PERMITTED_POLICIES = new Set([
  "none",
  "master-only",
  "by-content-type",
  "all",
]);

function getHeaderValueFromOptions({
  permittedPolicies = "none",
}: Readonly<XPermittedCrossDomainPoliciesOptions>): string {
  if (ALLOWED_PERMITTED_POLICIES.has(permittedPolicies)) {
    return permittedPolicies;
  } else {
    throw new Error(
      `X-Permitted-Cross-Domain-Policies does not support ${JSON.stringify(
        permittedPolicies
      )}`
    );
  }
}

function xPermittedCrossDomainPolicies(
  options: Readonly<XPermittedCrossDomainPoliciesOptions> = {}
) {
  const headerValue = getHeaderValueFromOptions(options);

  return function xPermittedCrossDomainPoliciesMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader("X-Permitted-Cross-Domain-Policies", headerValue);
    next();
  };
}

export default xPermittedCrossDomainPolicies;
