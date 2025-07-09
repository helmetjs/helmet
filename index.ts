import type { IncomingMessage, ServerResponse } from "node:http";
import contentSecurityPolicy, {
  type ContentSecurityPolicyOptions,
} from "./middlewares/content-security-policy/index.js";
import crossOriginEmbedderPolicy, {
  type CrossOriginEmbedderPolicyOptions,
} from "./middlewares/cross-origin-embedder-policy/index.js";
import crossOriginOpenerPolicy, {
  type CrossOriginOpenerPolicyOptions,
} from "./middlewares/cross-origin-opener-policy/index.js";
import crossOriginResourcePolicy, {
  type CrossOriginResourcePolicyOptions,
} from "./middlewares/cross-origin-resource-policy/index.js";
import originAgentCluster from "./middlewares/origin-agent-cluster/index.js";
import referrerPolicy, {
  type ReferrerPolicyOptions,
} from "./middlewares/referrer-policy/index.js";
import strictTransportSecurity, {
  type StrictTransportSecurityOptions,
} from "./middlewares/strict-transport-security/index.js";
import xContentTypeOptions from "./middlewares/x-content-type-options/index.js";
import xDnsPrefetchControl, {
  type XDnsPrefetchControlOptions,
} from "./middlewares/x-dns-prefetch-control/index.js";
import xDownloadOptions from "./middlewares/x-download-options/index.js";
import xFrameOptions, {
  type XFrameOptionsOptions,
} from "./middlewares/x-frame-options/index.js";
import xPermittedCrossDomainPolicies, {
  type XPermittedCrossDomainPoliciesOptions,
} from "./middlewares/x-permitted-cross-domain-policies/index.js";
import xPoweredBy from "./middlewares/x-powered-by/index.js";
import xXssProtection from "./middlewares/x-xss-protection/index.js";

export type HelmetOptions = {
  contentSecurityPolicy?: ContentSecurityPolicyOptions | boolean;
  crossOriginEmbedderPolicy?: CrossOriginEmbedderPolicyOptions | boolean;
  crossOriginOpenerPolicy?: CrossOriginOpenerPolicyOptions | boolean;
  crossOriginResourcePolicy?: CrossOriginResourcePolicyOptions | boolean;
  originAgentCluster?: boolean;
  referrerPolicy?: ReferrerPolicyOptions | boolean;
} & (
  | {
      strictTransportSecurity?: StrictTransportSecurityOptions | boolean;
      hsts?: never;
    }
  | {
      hsts?: StrictTransportSecurityOptions | boolean;
      strictTransportSecurity?: never;
    }
) &
  (
    | { xContentTypeOptions?: boolean; noSniff?: never }
    | { noSniff?: boolean; xContentTypeOptions?: never }
  ) &
  (
    | {
        xDnsPrefetchControl?: XDnsPrefetchControlOptions | boolean;
        dnsPrefetchControl?: never;
      }
    | {
        dnsPrefetchControl?: XDnsPrefetchControlOptions | boolean;
        xDnsPrefetchControl?: never;
      }
  ) &
  (
    | { xDownloadOptions?: boolean; ieNoOpen?: never }
    | { ieNoOpen?: boolean; xDownloadOptions?: never }
  ) &
  (
    | { xFrameOptions?: XFrameOptionsOptions | boolean; frameguard?: never }
    | { frameguard?: XFrameOptionsOptions | boolean; xFrameOptions?: never }
  ) &
  (
    | {
        xPermittedCrossDomainPolicies?:
          | XPermittedCrossDomainPoliciesOptions
          | boolean;
        permittedCrossDomainPolicies?: never;
      }
    | {
        permittedCrossDomainPolicies?:
          | XPermittedCrossDomainPoliciesOptions
          | boolean;
        xPermittedCrossDomainPolicies?: never;
      }
  ) &
  (
    | { xPoweredBy?: boolean; hidePoweredBy?: never }
    | { hidePoweredBy?: boolean; xPoweredBy?: never }
  ) &
  (
    | { xXssProtection?: boolean; xssFilter?: never }
    | { xssFilter?: boolean; xXssProtection?: never }
  );

type MiddlewareFunction = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: Error) => void,
) => void;

interface Helmet {
  (
    options?: Readonly<HelmetOptions>,
  ): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void,
  ) => void;

  contentSecurityPolicy: typeof contentSecurityPolicy;
  crossOriginEmbedderPolicy: typeof crossOriginEmbedderPolicy;
  crossOriginOpenerPolicy: typeof crossOriginOpenerPolicy;
  crossOriginResourcePolicy: typeof crossOriginResourcePolicy;
  originAgentCluster: typeof originAgentCluster;
  referrerPolicy: typeof referrerPolicy;
  strictTransportSecurity: typeof strictTransportSecurity;
  xContentTypeOptions: typeof xContentTypeOptions;
  xDnsPrefetchControl: typeof xDnsPrefetchControl;
  xDownloadOptions: typeof xDownloadOptions;
  xFrameOptions: typeof xFrameOptions;
  xPermittedCrossDomainPolicies: typeof xPermittedCrossDomainPolicies;
  xPoweredBy: typeof xPoweredBy;
  xXssProtection: typeof xXssProtection;

  // Legacy aliases
  dnsPrefetchControl: typeof xDnsPrefetchControl;
  frameguard: typeof xFrameOptions;
  hidePoweredBy: typeof xPoweredBy;
  hsts: typeof strictTransportSecurity;
  ieNoOpen: typeof xDownloadOptions;
  noSniff: typeof xContentTypeOptions;
  permittedCrossDomainPolicies: typeof xPermittedCrossDomainPolicies;
  xssFilter: typeof xXssProtection;
}

function getMiddlewareFunctionsFromOptions(
  options: Readonly<HelmetOptions>,
): MiddlewareFunction[] {
  const result: MiddlewareFunction[] = [];

  switch (options.contentSecurityPolicy) {
    case undefined:
    case true:
      result.push(contentSecurityPolicy());
      break;
    case false:
      break;
    default:
      result.push(contentSecurityPolicy(options.contentSecurityPolicy));
      break;
  }

  switch (options.crossOriginEmbedderPolicy) {
    case undefined:
    case false:
      break;
    case true:
      result.push(crossOriginEmbedderPolicy());
      break;
    default:
      result.push(crossOriginEmbedderPolicy(options.crossOriginEmbedderPolicy));
      break;
  }

  switch (options.crossOriginOpenerPolicy) {
    case undefined:
    case true:
      result.push(crossOriginOpenerPolicy());
      break;
    case false:
      break;
    default:
      result.push(crossOriginOpenerPolicy(options.crossOriginOpenerPolicy));
      break;
  }

  switch (options.crossOriginResourcePolicy) {
    case undefined:
    case true:
      result.push(crossOriginResourcePolicy());
      break;
    case false:
      break;
    default:
      result.push(crossOriginResourcePolicy(options.crossOriginResourcePolicy));
      break;
  }

  switch (options.originAgentCluster) {
    case undefined:
    case true:
      result.push(originAgentCluster());
      break;
    case false:
      break;
    default:
      console.warn(
        "Origin-Agent-Cluster does not take options. Remove the property to silence this warning.",
      );
      result.push(originAgentCluster());
      break;
  }

  switch (options.referrerPolicy) {
    case undefined:
    case true:
      result.push(referrerPolicy());
      break;
    case false:
      break;
    default:
      result.push(referrerPolicy(options.referrerPolicy));
      break;
  }

  if ("strictTransportSecurity" in options && "hsts" in options) {
    throw new Error(
      "Strict-Transport-Security option was specified twice. Remove the `hsts` option to fix this error.",
    );
  }
  const strictTransportSecurityOption =
    options.strictTransportSecurity ?? options.hsts;
  switch (strictTransportSecurityOption) {
    case undefined:
    case true:
      result.push(strictTransportSecurity());
      break;
    case false:
      break;
    default:
      result.push(strictTransportSecurity(strictTransportSecurityOption));
      break;
  }

  if ("xContentTypeOptions" in options && "noSniff" in options) {
    throw new Error(
      "X-Content-Type-Options option was specified twice. Remove the `noSniff` option to fix this error.",
    );
  }
  const xContentTypeOptionsOption =
    options.xContentTypeOptions ?? options.noSniff;
  switch (xContentTypeOptionsOption) {
    case undefined:
    case true:
      result.push(xContentTypeOptions());
      break;
    case false:
      break;
    default:
      console.warn(
        "X-Content-Type-Options does not take options. Remove the property to silence this warning.",
      );
      result.push(xContentTypeOptions());
      break;
  }

  if ("xDnsPrefetchControl" in options && "dnsPrefetchControl" in options) {
    throw new Error(
      "X-DNS-Prefetch-Control option was specified twice. Remove the `dnsPrefetchControl` option to fix this error.",
    );
  }
  const xDnsPrefetchControlOption =
    options.xDnsPrefetchControl ?? options.dnsPrefetchControl;
  switch (xDnsPrefetchControlOption) {
    case undefined:
    case true:
      result.push(xDnsPrefetchControl());
      break;
    case false:
      break;
    default:
      result.push(xDnsPrefetchControl(xDnsPrefetchControlOption));
      break;
  }

  if ("xDownloadOptions" in options && "ieNoOpen" in options) {
    throw new Error(
      "X-Download-Options option was specified twice. Remove the `ieNoOpen` option to fix this error.",
    );
  }
  const xDownloadOptionsOption = options.xDownloadOptions ?? options.ieNoOpen;
  switch (xDownloadOptionsOption) {
    case undefined:
    case true:
      result.push(xDownloadOptions());
      break;
    case false:
      break;
    default:
      console.warn(
        "X-Download-Options does not take options. Remove the property to silence this warning.",
      );
      result.push(xDownloadOptions());
      break;
  }

  if ("xFrameOptions" in options && "frameguard" in options) {
    throw new Error(
      "X-Frame-Options option was specified twice. Remove the `frameguard` option to fix this error.",
    );
  }
  const xFrameOptionsOption = options.xFrameOptions ?? options.frameguard;
  switch (xFrameOptionsOption) {
    case undefined:
    case true:
      result.push(xFrameOptions());
      break;
    case false:
      break;
    default:
      result.push(xFrameOptions(xFrameOptionsOption));
      break;
  }

  if (
    "xPermittedCrossDomainPolicies" in options &&
    "permittedCrossDomainPolicies" in options
  ) {
    throw new Error(
      "X-Permitted-Cross-Domain-Policies option was specified twice. Remove the `permittedCrossDomainPolicies` option to fix this error.",
    );
  }
  const xPermittedCrossDomainPoliciesOption =
    options.xPermittedCrossDomainPolicies ??
    options.permittedCrossDomainPolicies;
  switch (xPermittedCrossDomainPoliciesOption) {
    case undefined:
    case true:
      result.push(xPermittedCrossDomainPolicies());
      break;
    case false:
      break;
    default:
      result.push(
        xPermittedCrossDomainPolicies(xPermittedCrossDomainPoliciesOption),
      );
      break;
  }

  if ("xPoweredBy" in options && "hidePoweredBy" in options) {
    throw new Error(
      "X-Powered-By option was specified twice. Remove the `hidePoweredBy` option to fix this error.",
    );
  }
  const xPoweredByOption = options.xPoweredBy ?? options.hidePoweredBy;
  switch (xPoweredByOption) {
    case undefined:
    case true:
      result.push(xPoweredBy());
      break;
    case false:
      break;
    default:
      console.warn(
        "X-Powered-By does not take options. Remove the property to silence this warning.",
      );
      result.push(xPoweredBy());
      break;
  }

  if ("xXssProtection" in options && "xssFilter" in options) {
    throw new Error(
      "X-XSS-Protection option was specified twice. Remove the `xssFilter` option to fix this error.",
    );
  }
  const xXssProtectionOption = options.xXssProtection ?? options.xssFilter;
  switch (xXssProtectionOption) {
    case undefined:
    case true:
      result.push(xXssProtection());
      break;
    case false:
      break;
    default:
      console.warn(
        "X-XSS-Protection does not take options. Remove the property to silence this warning.",
      );
      result.push(xXssProtection());
      break;
  }

  return result;
}

const helmet: Helmet = Object.assign(
  function helmet(options: Readonly<HelmetOptions> = {}) {
    // People should be able to pass an options object with no prototype,
    // so we want this optional chaining.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (options.constructor?.name === "IncomingMessage") {
      throw new Error(
        "It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`.",
      );
    }

    const middlewareFunctions = getMiddlewareFunctionsFromOptions(options);

    return function helmetMiddleware(
      req: IncomingMessage,
      res: ServerResponse,
      next: (err?: unknown) => void,
    ): void {
      let middlewareIndex = 0;

      (function internalNext(err?: unknown) {
        if (err) {
          next(err);
          return;
        }

        const middlewareFunction = middlewareFunctions[middlewareIndex];
        if (middlewareFunction) {
          middlewareIndex++;
          middlewareFunction(req, res, internalNext);
        } else {
          next();
        }
      })();
    };
  },
  {
    contentSecurityPolicy,
    crossOriginEmbedderPolicy,
    crossOriginOpenerPolicy,
    crossOriginResourcePolicy,
    originAgentCluster,
    referrerPolicy,
    strictTransportSecurity,
    xContentTypeOptions,
    xDnsPrefetchControl,
    xDownloadOptions,
    xFrameOptions,
    xPermittedCrossDomainPolicies,
    xPoweredBy,
    xXssProtection,

    // Legacy aliases
    dnsPrefetchControl: xDnsPrefetchControl,
    xssFilter: xXssProtection,
    permittedCrossDomainPolicies: xPermittedCrossDomainPolicies,
    ieNoOpen: xDownloadOptions,
    noSniff: xContentTypeOptions,
    frameguard: xFrameOptions,
    hidePoweredBy: xPoweredBy,
    hsts: strictTransportSecurity,
  },
);

export default helmet;

export {
  contentSecurityPolicy,
  crossOriginEmbedderPolicy,
  crossOriginOpenerPolicy,
  crossOriginResourcePolicy,
  originAgentCluster,
  referrerPolicy,
  strictTransportSecurity,
  xContentTypeOptions,
  xDnsPrefetchControl,
  xDownloadOptions,
  xFrameOptions,
  xPoweredBy,
  xXssProtection,

  // Legacy aliases
  strictTransportSecurity as hsts,
  xContentTypeOptions as noSniff,
  xDnsPrefetchControl as dnsPrefetchControl,
  xDownloadOptions as ieNoOpen,
  xFrameOptions as frameguard,
  xPermittedCrossDomainPolicies,
  xPermittedCrossDomainPolicies as permittedCrossDomainPolicies,
  xPoweredBy as hidePoweredBy,
  xXssProtection as xssFilter,
};
