import { IncomingMessage, ServerResponse } from "http";
import contentSecurityPolicy from "./middlewares/content-security-policy";
import expectCt from "./middlewares/expect-ct";
import referrerPolicy from "./middlewares/referrer-policy";
import xContentTypeOptions from "./middlewares/x-content-type-options";
import xDnsPrefetchControl from "./middlewares/x-dns-prefetch-control";
import xDownloadOptions from "./middlewares/x-download-options";
import xFrameOptions from "./middlewares/x-frame-options";
import xPermittedCrossDomainPolicies from "./middlewares/x-permitted-cross-domain-policies";
import xPoweredBy from "./middlewares/x-powered-by";

interface HelmetOptions {
  contentSecurityPolicy?: any;
  dnsPrefetchControl?: any;
  expectCt?: any;
  frameguard?: any;
  hidePoweredBy?: any;
  hsts?: any;
  ieNoOpen?: any;
  noSniff?: any;
  permittedCrossDomainPolicies?: any;
  referrerPolicy?: any;
  xssFilter?: any;
}

interface MiddlewareFunction {
  (req: IncomingMessage, res: ServerResponse, next: () => void): void;
}

const DEFAULT_MIDDLEWARE = [
  "dnsPrefetchControl",
  "frameguard",
  "hidePoweredBy",
  "hsts",
  "ieNoOpen",
  "noSniff",
  "xssFilter",
];

type MiddlewareName =
  | "contentSecurityPolicy"
  | "dnsPrefetchControl"
  | "expectCt"
  | "frameguard"
  | "hidePoweredBy"
  | "hsts"
  | "ieNoOpen"
  | "noSniff"
  | "permittedCrossDomainPolicies"
  | "referrerPolicy"
  | "xssFilter";

const middlewares: MiddlewareName[] = [
  "contentSecurityPolicy",
  "dnsPrefetchControl",
  "expectCt",
  "frameguard",
  "hidePoweredBy",
  "hsts",
  "ieNoOpen",
  "noSniff",
  "permittedCrossDomainPolicies",
  "referrerPolicy",
  "xssFilter",
];

function helmet(options: Readonly<HelmetOptions> = {}) {
  if (options.constructor.name === "IncomingMessage") {
    throw new Error(
      "It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`."
    );
  }

  const stack: MiddlewareFunction[] = middlewares.reduce(function (
    result,
    middlewareName
  ) {
    const middleware = helmet[middlewareName];
    let middlewareOptions = options[middlewareName];
    const isDefault = DEFAULT_MIDDLEWARE.indexOf(middlewareName) !== -1;

    if (middlewareOptions === false) {
      return result;
    } else if (middlewareOptions === true) {
      middlewareOptions = {};
    }

    if (middlewareOptions != null) {
      return result.concat(middleware(middlewareOptions));
    } else if (isDefault) {
      return result.concat(middleware({}));
    }
    return result;
  },
  []);

  return function helmet(
    req: IncomingMessage,
    res: ServerResponse,
    next: (...args: unknown[]) => void
  ) {
    let index = 0;

    function internalNext(...args: unknown[]) {
      if (args.length > 0) {
        next(...args);
        return;
      }

      const middleware = stack[index];
      if (!middleware) {
        return next();
      }

      index++;

      middleware(req, res, internalNext);
    }

    internalNext();
  };
}

helmet.contentSecurityPolicy = contentSecurityPolicy;
helmet.dnsPrefetchControl = xDnsPrefetchControl;
helmet.expectCt = expectCt;
helmet.frameguard = xFrameOptions;
helmet.hidePoweredBy = xPoweredBy;
helmet.hsts = require("hsts");
helmet.ieNoOpen = xDownloadOptions;
helmet.noSniff = xContentTypeOptions;
helmet.permittedCrossDomainPolicies = xPermittedCrossDomainPolicies;
helmet.referrerPolicy = referrerPolicy;
helmet.xssFilter = require("x-xss-protection");

export = helmet;
