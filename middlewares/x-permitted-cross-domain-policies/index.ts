import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Options for configuring the `X-Permitted-Cross-Domain-Policies` header.
 */
export interface XPermittedCrossDomainPoliciesOptions {
  /**
   * Specifies the permitted cross-domain policies.
   * - "none": No policy files are allowed (recommended for security).
   * - "master-only": Only the master policy file is allowed.
   * - "by-content-type": Only policies for specific content types are allowed.
   * - "all": All policy files are allowed (least secure).
   * @default "none"
   */
  permittedPolicies?: "none" | "master-only" | "by-content-type" | "all";
}

const ALLOWED_PERMITTED_POLICIES = new Set([
  "none",
  "master-only",
  "by-content-type",
  "all",
]);

/**
 * Validates and returns the header value from the options.
 * @private
 */
function getHeaderValueFromOptions({
  permittedPolicies = "none",
}: Readonly<XPermittedCrossDomainPoliciesOptions>): string {
  if (ALLOWED_PERMITTED_POLICIES.has(permittedPolicies)) {
    return permittedPolicies;
  } else {
    throw new Error(
      `X-Permitted-Cross-Domain-Policies does not support ${JSON.stringify(
        permittedPolicies,
      )}. Allowed values are: none, master-only, by-content-type, all.`,
    );
  }
}

/**
 * Middleware to set the `X-Permitted-Cross-Domain-Policies` header.
 * @param {XPermittedCrossDomainPoliciesOptions} [options]
 * @returns {Function} Express/Connect middleware.
 */
function xPermittedCrossDomainPolicies(
  options: Readonly<XPermittedCrossDomainPoliciesOptions> = {},
) {
  const headerValue = getHeaderValueFromOptions(options);

  return function xPermittedCrossDomainPoliciesMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) {
    res.setHeader("X-Permitted-Cross-Domain-Policies", headerValue);
    next();
  };
}

export default xPermittedCrossDomainPolicies;
