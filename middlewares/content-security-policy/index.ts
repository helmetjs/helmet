import { IncomingMessage, ServerResponse } from "http";

export interface ContentSecurityPolicyOptions {
  directives?: {
    [directiveName: string]: Iterable<string>;
  };
  reportOnly?: boolean;
}

const isRawPolicyDirectiveNameInvalid = (rawDirectiveName: string): boolean =>
  rawDirectiveName.length === 0 || /[^a-zA-Z0-9-]/.test(rawDirectiveName);

const dashify = (str: string): string =>
  str.replace(/[A-Z]/g, (capitalLetter) => "-" + capitalLetter.toLowerCase());

function getHeaderNameFromOptions({
  reportOnly,
}: ContentSecurityPolicyOptions): string {
  if (reportOnly) {
    return "Content-Security-Policy-Report-Only";
  } else {
    return "Content-Security-Policy";
  }
}

function getHeaderValueFromOptions(
  options: ContentSecurityPolicyOptions
): string {
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

  const {
    directives = {
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
    },
  } = options;

  const directiveNamesUsed = new Set<string>();

  const result = Object.entries(directives)
    .map(([rawDirectiveName, rawDirectiveValue]) => {
      if (isRawPolicyDirectiveNameInvalid(rawDirectiveName)) {
        throw new Error(
          `Content-Security-Policy received an invalid directive name ${JSON.stringify(
            rawDirectiveName
          )}`
        );
      }
      const directiveName = dashify(rawDirectiveName);
      if (directiveNamesUsed.has(directiveName)) {
        throw new Error(
          `Content-Security-Policy received a duplicate directive ${JSON.stringify(
            directiveName
          )}`
        );
      }
      directiveNamesUsed.add(directiveName);

      let directiveValue: string;
      if (typeof rawDirectiveValue === "string") {
        directiveValue = " " + rawDirectiveValue;
      } else {
        directiveValue = "";
        for (const element of rawDirectiveValue) {
          directiveValue += " " + element;
        }
      }

      if (!directiveValue) {
        return directiveName;
      }

      if (/;|,/.test(directiveValue)) {
        throw new Error(
          `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
            directiveName
          )}`
        );
      }

      return `${directiveName}${directiveValue}`;
    })
    .join(";");

  if (!directiveNamesUsed.has("default-src")) {
    throw new Error(
      "Content-Security-Policy needs a default-src but none was provided"
    );
  }

  return result;
}

function contentSecurityPolicy(
  options: Readonly<ContentSecurityPolicyOptions> = {}
) {
  const headerName = getHeaderNameFromOptions(options);
  const headerValue = getHeaderValueFromOptions(options);

  return function contentSecurityPolicyMiddleware(
    _req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) {
    res.setHeader(headerName, headerValue);
    next();
  };
}

module.exports = contentSecurityPolicy;
export default contentSecurityPolicy;
