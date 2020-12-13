import { IncomingMessage, ServerResponse } from "http";

interface ContentSecurityPolicyDirectiveValueFunction {
  (req: IncomingMessage, res: ServerResponse): string;
}

type ContentSecurityPolicyDirectiveValue =
  | string
  | ContentSecurityPolicyDirectiveValueFunction;

interface ContentSecurityPolicyDirectives {
  [directiveName: string]: Iterable<ContentSecurityPolicyDirectiveValue>;
}

export interface ContentSecurityPolicyOptions {
  directives?: ContentSecurityPolicyDirectives;
  reportOnly?: boolean;
}

const DEFAULT_DIRECTIVES: ContentSecurityPolicyDirectives = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "block-all-mixed-content": [],
  "font-src": ["'self'", "https:", "data:"],
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
): ContentSecurityPolicyDirectives {
  const result: ContentSecurityPolicyDirectives = {};

  const { directives: rawDirectives = getDefaultDirectives() } = options;

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

    if (has(result, directiveName)) {
      throw new Error(
        `Content-Security-Policy received a duplicate directive ${JSON.stringify(
          directiveName
        )}`
      );
    }

    const rawDirectiveValue = rawDirectives[rawDirectiveName];
    let directiveValue: Iterable<ContentSecurityPolicyDirectiveValue>;
    if (typeof rawDirectiveValue === "string") {
      directiveValue = [rawDirectiveValue];
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

    result[directiveName] = directiveValue;
  }

  if (!("default-src" in result)) {
    throw new Error(
      "Content-Security-Policy needs a default-src but none was provided"
    );
  }

  return result;
}

function getHeaderValue(
  req: IncomingMessage,
  res: ServerResponse,
  directives: ContentSecurityPolicyDirectives
): string | Error {
  const result: string[] = [];

  for (const directiveName in directives) {
    if (!has(directives, directiveName)) {
      continue;
    }

    const rawDirectiveValue = directives[directiveName];
    let directiveValue = "";
    for (const element of rawDirectiveValue) {
      if (element instanceof Function) {
        directiveValue += " " + element(req, res);
      } else {
        directiveValue += " " + element;
      }
    }

    if (!directiveValue) {
      result.push(directiveName);
    } else if (isDirectiveValueInvalid(directiveValue)) {
      return new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
          directiveName
        )}`
      );
    } else {
      result.push(`${directiveName}${directiveValue}`);
    }
  }

  return result.join(";");
}

function contentSecurityPolicy(
  options: Readonly<ContentSecurityPolicyOptions> = {}
): (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: Error) => void
) => void {
  if ("loose" in options) {
    console.warn(
      "Content-Security-Policy middleware no longer needs the `loose` parameter. You should remove it."
    );
  }
  if ("setAllHeaders" in options) {
    console.warn(
      "Content-Security-Policy middleware no longer supports the `setAllHeaders` parameter. See <https://github.com/helmetjs/helmet/wiki/Setting-legacy-Content-Security-Policy-headers-in-Helmet-4>."
    );
  }
  ["disableAndroid", "browserSniff"].forEach((deprecatedOption) => {
    if (deprecatedOption in options) {
      console.warn(
        `Content-Security-Policy middleware no longer does browser sniffing, so you can remove the \`${deprecatedOption}\` option. See <https://github.com/helmetjs/csp/issues/97> for discussion.`
      );
    }
  });

  const headerName = options.reportOnly
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";

  const directives = normalizeDirectives(options);

  return function contentSecurityPolicyMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: (error?: Error) => void
  ) {
    const result = getHeaderValue(req, res, directives);
    if (result instanceof Error) {
      next(result);
    } else {
      res.setHeader(headerName, result);
      next();
    }
  };
}
contentSecurityPolicy.getDefaultDirectives = getDefaultDirectives;

module.exports = contentSecurityPolicy;
export default contentSecurityPolicy;
export { getDefaultDirectives };
