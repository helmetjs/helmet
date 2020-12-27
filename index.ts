import { IncomingMessage, ServerResponse } from "http";
import contentSecurityPolicy, {
  ContentSecurityPolicyOptions,
} from "./middlewares/content-security-policy";
import expectCt, { ExpectCtOptions } from "./middlewares/expect-ct";
import referrerPolicy, {
  ReferrerPolicyOptions,
} from "./middlewares/referrer-policy";
import strictTransportSecurity, {
  StrictTransportSecurityOptions,
} from "./middlewares/strict-transport-security";
import xContentTypeOptions from "./middlewares/x-content-type-options";
import xDnsPrefetchControl, {
  XDnsPrefetchControlOptions,
} from "./middlewares/x-dns-prefetch-control";
import xDownloadOptions from "./middlewares/x-download-options";
import xFrameOptions, {
  XFrameOptionsOptions,
} from "./middlewares/x-frame-options";
import xPermittedCrossDomainPolicies, {
  XPermittedCrossDomainPoliciesOptions,
} from "./middlewares/x-permitted-cross-domain-policies";
import xPoweredBy from "./middlewares/x-powered-by";
import xXssProtection from "./middlewares/x-xss-protection";

interface HelmetOptions {
  contentSecurityPolicy?: MiddlewareOption<ContentSecurityPolicyOptions>;
  dnsPrefetchControl?: MiddlewareOption<XDnsPrefetchControlOptions>;
  expectCt?: MiddlewareOption<ExpectCtOptions>;
  frameguard?: MiddlewareOption<XFrameOptionsOptions>;
  hidePoweredBy?: MiddlewareOption<never>;
  hsts?: MiddlewareOption<StrictTransportSecurityOptions>;
  ieNoOpen?: MiddlewareOption<never>;
  noSniff?: MiddlewareOption<never>;
  permittedCrossDomainPolicies?: MiddlewareOption<XPermittedCrossDomainPoliciesOptions>;
  referrerPolicy?: MiddlewareOption<ReferrerPolicyOptions>;
  xssFilter?: MiddlewareOption<never>;
}

type MiddlewareOption<T> = false | T;

interface MiddlewareFunction {
  (
    req: IncomingMessage,
    res: ServerResponse,
    next: (error?: Error) => void
  ): void;
}

interface Helmet {
  (options?: Readonly<HelmetOptions>): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void
  ) => void;

  contentSecurityPolicy: typeof contentSecurityPolicy;
  dnsPrefetchControl: typeof xDnsPrefetchControl;
  expectCt: typeof expectCt;
  frameguard: typeof xFrameOptions;
  hidePoweredBy: typeof xPoweredBy;
  hsts: typeof strictTransportSecurity;
  ieNoOpen: typeof xDownloadOptions;
  noSniff: typeof xContentTypeOptions;
  permittedCrossDomainPolicies: typeof xPermittedCrossDomainPolicies;
  referrerPolicy: typeof referrerPolicy;
  xssFilter: typeof xXssProtection;

  featurePolicy: () => never;
  hpkp: () => never;
  noCache: () => never;
}

const helmet: Helmet = Object.assign(
  function helmet(options: Readonly<HelmetOptions> = {}) {
    if (options.constructor?.name === "IncomingMessage") {
      throw new Error(
        "It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`."
      );
    }

    if (Object.values(options).some((option) => option === true)) {
      throw new Error(
        "Helmet no longer supports `true` as a middleware option. Remove the property from your options to fix this error."
      );
    }

    const middlewareFunctions: MiddlewareFunction[] = [];

    if (options.contentSecurityPolicy !== false) {
      middlewareFunctions.push(
        contentSecurityPolicy(options.contentSecurityPolicy)
      );
    }
    if (options.dnsPrefetchControl !== false) {
      middlewareFunctions.push(xDnsPrefetchControl(options.dnsPrefetchControl));
    }
    if (options.expectCt !== false) {
      middlewareFunctions.push(expectCt(options.expectCt));
    }
    if (options.frameguard !== false) {
      middlewareFunctions.push(xFrameOptions(options.frameguard));
    }
    if (options.hidePoweredBy !== false) {
      if (options.hidePoweredBy !== undefined) {
        console.warn(
          "hidePoweredBy does not take options. Remove the property to silence this warning."
        );
      }
      middlewareFunctions.push(xPoweredBy());
    }
    if (options.hsts !== false) {
      middlewareFunctions.push(strictTransportSecurity(options.hsts));
    }
    if (options.ieNoOpen !== false) {
      if (options.ieNoOpen !== undefined) {
        console.warn(
          "ieNoOpen does not take options. Remove the property to silence this warning."
        );
      }
      middlewareFunctions.push(xDownloadOptions());
    }
    if (options.noSniff !== false) {
      if (options.noSniff !== undefined) {
        console.warn(
          "noSniff does not take options. Remove the property to silence this warning."
        );
      }
      middlewareFunctions.push(xContentTypeOptions());
    }
    if (options.permittedCrossDomainPolicies !== false) {
      middlewareFunctions.push(
        xPermittedCrossDomainPolicies(options.permittedCrossDomainPolicies)
      );
    }
    if (options.referrerPolicy !== false) {
      middlewareFunctions.push(referrerPolicy(options.referrerPolicy));
    }
    if (options.xssFilter !== false) {
      if (options.xssFilter !== undefined) {
        console.warn(
          "xssFilter does not take options. Remove the property to silence this warning."
        );
      }
      middlewareFunctions.push(xXssProtection());
    }

    return function helmetMiddleware(
      req: IncomingMessage,
      res: ServerResponse,
      next: (err?: unknown) => void
    ): void {
      const iterator = middlewareFunctions[Symbol.iterator]();

      (function internalNext(err?: unknown) {
        if (err) {
          next(err);
          return;
        }

        const iteration = iterator.next();
        if (iteration.done) {
          next();
        } else {
          const middlewareFunction = iteration.value;
          middlewareFunction(req, res, internalNext);
        }
      })();
    };
  },
  {
    contentSecurityPolicy: contentSecurityPolicy,
    dnsPrefetchControl: xDnsPrefetchControl,
    expectCt: expectCt,
    frameguard: xFrameOptions,
    hidePoweredBy: xPoweredBy,
    hsts: strictTransportSecurity,
    ieNoOpen: xDownloadOptions,
    noSniff: xContentTypeOptions,
    permittedCrossDomainPolicies: xPermittedCrossDomainPolicies,
    referrerPolicy: referrerPolicy,
    xssFilter: xXssProtection,
    featurePolicy() {
      throw new Error(
        "helmet.featurePolicy was removed because the Feature-Policy header is deprecated. If you still need this header, you can use the `feature-policy` module."
      );
    },
    hpkp() {
      throw new Error(
        "helmet.hpkp was removed because the header has been deprecated. If you still need this header, you can use the `hpkp` module. For more, see <https://github.com/helmetjs/helmet/issues/180>."
      );
    },
    noCache() {
      throw new Error(
        "helmet.noCache was removed. You can use the `nocache` module instead. For more, see <https://github.com/helmetjs/helmet/issues/215>."
      );
    },
  }
);

export = helmet;
