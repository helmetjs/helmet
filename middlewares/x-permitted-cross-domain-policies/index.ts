import { IncomingMessage, ServerResponse } from "http";

interface XPermittedCrossDomainPoliciesOptions {
  permittedPolicies?: string;
}

function getHeaderValueFromOptions(
  options: Readonly<XPermittedCrossDomainPoliciesOptions>
): string {
  const DEFAULT_PERMITTED_POLICIES = "none";
  const ALLOWED_POLICIES = ["none", "master-only", "by-content-type", "all"];

  let permittedPolicies: string;
  if (options.permittedPolicies === undefined) {
    permittedPolicies = DEFAULT_PERMITTED_POLICIES;
  } else {
    permittedPolicies = options.permittedPolicies as string;
  }

  if (ALLOWED_POLICIES.indexOf(permittedPolicies) === -1) {
    throw new Error(
      `X-Permitted-Cross-Domain-Policies does not support ${JSON.stringify(
        permittedPolicies
      )} as a permitted policy`
    );
  }

  return permittedPolicies;
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

module.exports = xPermittedCrossDomainPolicies;
export default xPermittedCrossDomainPolicies;
