import { IncomingMessage, ServerResponse } from "http";

interface ContentSecurityPolicyDirectiveValueFunction {
  (req: IncomingMessage, res: ServerResponse): string;
}

type ContentSecurityPolicyDirectiveValue =
  | string
  | ContentSecurityPolicyDirectiveValueFunction;

export interface ContentSecurityPolicyOptions {
  useDefaults?: boolean;
  directives?: Record<
    string,
    | null
    | Iterable<ContentSecurityPolicyDirectiveValue>
    | typeof dangerouslyDisableDefaultSrc
  >;
  reportOnly?: boolean;
}

type NormalizedDirectives = Map<
  string,
  Iterable<ContentSecurityPolicyDirectiveValue>
>;

interface ContentSecurityPolicy {
  (options?: Readonly<ContentSecurityPolicyOptions>): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: Error) => void
  ) => void;
  getDefaultDirectives: typeof getDefaultDirectives;
  dangerouslyDisableDefaultSrc: typeof dangerouslyDisableDefaultSrc;
}

const dangerouslyDisableDefaultSrc = Symbol("dangerouslyDisableDefaultSrc");

const DEFAULT_DIRECTIVES: Record<
  string,
  Iterable<ContentSecurityPolicyDirectiveValue>
> = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "block-all-mixed-content": [],
  "font-src": ["'self'", "https:", "data:"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  "img-src": ["'self'", "data:"],
  "object-src": ["'none'"],
  "script-src": ["'self'"],
  "script-src-attr": ["'none'"],
  "style-src": ["'self'", "https:", "'unsafe-inline'"],
  "upgrade-insecure-requests": [],
};

const getDefaultDirectives = () => ({ ...DEFAULT_DIRECTIVES });

const dashify = (str: string): string =>
  str.replace(/[A-Z]/g, (capitalLetter) => "-" + capitalLetter.toLowerCase());

const isDirectiveValueInvalid = (directiveValue: string): boolean =>
  /;|,/.test(directiveValue);

const has = (obj: Readonly<object>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

function normalizeDirectives(
  options: Readonly<ContentSecurityPolicyOptions>
): NormalizedDirectives {
  const defaultDirectives = getDefaultDirectives();

  const { useDefaults = true, directives: rawDirectives = defaultDirectives } =
    options;

  const result: NormalizedDirectives = new Map();
  const directiveNamesSeen = new Set<string>();
  const directivesExplicitlyDisabled = new Set<string>();

  for (const rawDirectiveName in rawDirectives) {
    if (!has(rawDirectives, rawDirectiveName)) {
      continue;
    }

    if (
      rawDirectiveName.length === 0 ||
      /[^a-zA-Z0-9-]/.test(rawDirectiveName)
    ) {
      throw new Error(
        `Content-Security-Policy received an invalid directive name ${JSON.stringify(
          rawDirectiveName
        )}`
      );
    }

    const directiveName = dashify(rawDirectiveName);

    if (directiveNamesSeen.has(directiveName)) {
      throw new Error(
        `Content-Security-Policy received a duplicate directive ${JSON.stringify(
          directiveName
        )}`
      );
    }
    directiveNamesSeen.add(directiveName);

    const rawDirectiveValue = rawDirectives[rawDirectiveName];
    let directiveValue: Iterable<ContentSecurityPolicyDirectiveValue>;
    if (rawDirectiveValue === null) {
      if (directiveName === "default-src") {
        throw new Error(
          "Content-Security-Policy needs a default-src but it was set to `null`. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`."
        );
      }
      directivesExplicitlyDisabled.add(directiveName);
      continue;
    } else if (typeof rawDirectiveValue === "string") {
      directiveValue = [rawDirectiveValue];
    } else if (!rawDirectiveValue) {
      throw new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
          directiveName
        )}`
      );
    } else if (rawDirectiveValue === dangerouslyDisableDefaultSrc) {
      if (directiveName === "default-src") {
        directivesExplicitlyDisabled.add("default-src");
        continue;
      } else {
        throw new Error(
          `Content-Security-Policy: tried to disable ${JSON.stringify(
            directiveName
          )} as if it were default-src; simply omit the key`
        );
      }
    } else {
      directiveValue = rawDirectiveValue;
    }
    for (const element of directiveValue) {
      if (typeof element === "string" && isDirectiveValueInvalid(element)) {
        throw new Error(
          `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
            directiveName
          )}`
        );
      }
    }

    result.set(directiveName, directiveValue);
  }

  if (useDefaults) {
    Object.entries(defaultDirectives).forEach(
      ([defaultDirectiveName, defaultDirectiveValue]) => {
        if (
          !result.has(defaultDirectiveName) &&
          !directivesExplicitlyDisabled.has(defaultDirectiveName)
        ) {
          result.set(defaultDirectiveName, defaultDirectiveValue);
        }
      }
    );
  }

  if (!result.size) {
    throw new Error(
      "Content-Security-Policy has no directives. Either set some or disable the header"
    );
  }
  if (
    !result.has("default-src") &&
    !directivesExplicitlyDisabled.has("default-src")
  ) {
    throw new Error(
      "Content-Security-Policy needs a default-src but none was provided. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`."
    );
  }

  return result;
}

function getHeaderValue(
  req: IncomingMessage,
  res: ServerResponse,
  normalizedDirectives: Readonly<NormalizedDirectives>
): string | Error {
  let err: undefined | Error;
  const result: string[] = [];

  normalizedDirectives.forEach((rawDirectiveValue, directiveName) => {
    let directiveValue = "";
    for (const element of rawDirectiveValue) {
      directiveValue +=
        " " + (element instanceof Function ? element(req, res) : element);
    }

    if (!directiveValue) {
      result.push(directiveName);
    } else if (isDirectiveValueInvalid(directiveValue)) {
      err = new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
          directiveName
        )}`
      );
    } else {
      result.push(`${directiveName}${directiveValue}`);
    }
  });

  return err ? err : result.join(";");
}

const contentSecurityPolicy: ContentSecurityPolicy =
  function contentSecurityPolicy(
    options: Readonly<ContentSecurityPolicyOptions> = {}
  ): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: Error) => void
  ) => void {
    const headerName = options.reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";

    const normalizedDirectives = normalizeDirectives(options);

    return function contentSecurityPolicyMiddleware(
      req: IncomingMessage,
      res: ServerResponse,
      next: (error?: Error) => void
    ) {
      const result = getHeaderValue(req, res, normalizedDirectives);
      if (result instanceof Error) {
        next(result);
      } else {
        res.setHeader(headerName, result);
        next();
      }
    };
  };
contentSecurityPolicy.getDefaultDirectives = getDefaultDirectives;
contentSecurityPolicy.dangerouslyDisableDefaultSrc =
  dangerouslyDisableDefaultSrc;

export default contentSecurityPolicy;

// !helmet-end-of-commonjs

export { getDefaultDirectives, dangerouslyDisableDefaultSrc };
