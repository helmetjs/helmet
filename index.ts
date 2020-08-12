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
  permittedCrossDomainPolicies?: MiddlewareOption<
    XPermittedCrossDomainPoliciesOptions
  >;
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

function helmet(options: Readonly<HelmetOptions> = {}) {
  if (options.constructor.name === "IncomingMessage") {
    throw new Error(
      "It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`."
    );
  }

  // This is overly verbose. It'd be nice to condense this while still being type-safe.

  if (Object.values(options).some((option) => option === true)) {
    throw new Error(
      "Helmet no longer supports `true` as a middleware option. Remove the property from your options to fix this error."
    );
  }

  const middlewareFunctions: MiddlewareFunction[] = [];

  if (options.contentSecurityPolicy === undefined) {
    middlewareFunctions.push(contentSecurityPolicy());
  } else if (options.contentSecurityPolicy !== false) {
    middlewareFunctions.push(
      contentSecurityPolicy(options.contentSecurityPolicy)
    );
  }

  if (options.dnsPrefetchControl === undefined) {
    middlewareFunctions.push(xDnsPrefetchControl());
  } else if (options.dnsPrefetchControl !== false) {
    middlewareFunctions.push(xDnsPrefetchControl(options.dnsPrefetchControl));
  }

  if (options.expectCt === undefined) {
    middlewareFunctions.push(expectCt());
  } else if (options.expectCt !== false) {
    middlewareFunctions.push(expectCt(options.expectCt));
  }

  if (options.frameguard === undefined) {
    middlewareFunctions.push(xFrameOptions());
  } else if (options.frameguard !== false) {
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

  if (options.hsts === undefined || options.hsts === true) {
    middlewareFunctions.push(strictTransportSecurity());
  } else if (options.hsts !== false) {
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

  if (options.permittedCrossDomainPolicies === undefined) {
    middlewareFunctions.push(xPermittedCrossDomainPolicies());
  } else if (options.permittedCrossDomainPolicies !== false) {
    middlewareFunctions.push(
      xPermittedCrossDomainPolicies(options.permittedCrossDomainPolicies)
    );
  }

  if (options.referrerPolicy === undefined) {
    middlewareFunctions.push(referrerPolicy());
  } else if (options.referrerPolicy !== false) {
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
}

helmet.contentSecurityPolicy = contentSecurityPolicy;
helmet.dnsPrefetchControl = xDnsPrefetchControl;
helmet.expectCt = expectCt;
helmet.frameguard = xFrameOptions;
helmet.hidePoweredBy = xPoweredBy;
helmet.hsts = strictTransportSecurity;
helmet.ieNoOpen = xDownloadOptions;
helmet.noSniff = xContentTypeOptions;
helmet.permittedCrossDomainPolicies = xPermittedCrossDomainPolicies;
helmet.referrerPolicy = referrerPolicy;
helmet.xssFilter = xXssProtection;

helmet.featurePolicy = () => {
  throw new Error(
    "helmet.featurePolicy was removed because the Feature-Policy header is deprecated. If you still need this header, you can use the `feature-policy` module."
  );
};

helmet.hpkp = () => {
  throw new Error(
    "helmet.hpkp was removed because the header has been deprecated. If you still need this header, you can use the `hpkp` module. For more, see <https://github.com/helmetjs/helmet/issues/180>."
  );
};

helmet.noCache = () => {
  throw new Error(
    "helmet.noCache was removed. You can use the `nocache` module instead. For more, see <https://github.com/helmetjs/helmet/issues/215>."
  );
};

export = helmet;
