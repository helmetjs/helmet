import type { IncomingMessage, ServerResponse } from "node:http";
import { dashify, errify, isString, throwErrorIfExists } from "./util";

type ContentSecurityPolicyDirectiveValueFunction = (
  req: IncomingMessage,
  res: ServerResponse,
) => string;

type ContentSecurityPolicyDirectiveValue =
  string | ContentSecurityPolicyDirectiveValueFunction;

type ContentSecurityPolicyDirectives = Record<
  string,
  | null
  | Iterable<ContentSecurityPolicyDirectiveValue>
  | typeof dangerouslyDisableDefaultSrc
>;

export type ContentSecurityPolicyOptions = { reportOnly?: boolean } & (
  | { useDefaults?: true; directives?: ContentSecurityPolicyDirectives }
  | { useDefaults: false; directives: ContentSecurityPolicyDirectives }
);

type ParsedDirectivesMap = Map<
  string,
  Iterable<ContentSecurityPolicyDirectiveValue>
>;

type ContentSecurityPolicy = {
  (
    options?: Readonly<ContentSecurityPolicyOptions>,
  ): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: Error) => void,
  ) => void;
  getDefaultDirectives: typeof getDefaultDirectives;
  dangerouslyDisableDefaultSrc: typeof dangerouslyDisableDefaultSrc;
};

const dangerouslyDisableDefaultSrc = Symbol("dangerouslyDisableDefaultSrc");

const SHOULD_BE_QUOTED: ReadonlySet<string> = new Set([
  "none",
  "self",
  "strict-dynamic",
  "report-sample",
  "inline-speculation-rules",
  "unsafe-inline",
  "unsafe-eval",
  "unsafe-hashes",
  "wasm-unsafe-eval",
]);

const getDefaultDirectives = (): Record<
  string,
  Iterable<ContentSecurityPolicyDirectiveValue>
> => ({
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "font-src": ["'self'", "https:", "data:"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'"],
  "img-src": ["'self'", "data:"],
  "object-src": ["'none'"],
  "script-src": ["'self'"],
  "script-src-attr": ["'none'"],
  "style-src": ["'self'", "https:", "'unsafe-inline'"],
  "upgrade-insecure-requests": [],
});

const parseDirectiveName = (rawDirectiveName: string): string => {
  if (
    rawDirectiveName.length === 0 ||
    !/^[a-z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(rawDirectiveName)
  ) {
    throw new Error(
      `Content-Security-Policy received an invalid directive name ${JSON.stringify(
        rawDirectiveName,
      )}`,
    );
  }
  return dashify(rawDirectiveName);
};

const getDirectiveValueValidationError = (
  directiveName: string,
  directiveValue: string,
): null | Error =>
  /;|,/.test(directiveValue)
    ? new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
          directiveName,
        )}`,
      )
    : null;

const getDirectiveValueEntryValidationError = (
  directiveName: string,
  directiveValueEntry: string,
): null | Error =>
  SHOULD_BE_QUOTED.has(directiveValueEntry) ||
  directiveValueEntry.startsWith("nonce-") ||
  directiveValueEntry.startsWith("sha256-") ||
  directiveValueEntry.startsWith("sha384-") ||
  directiveValueEntry.startsWith("sha512-")
    ? new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
          directiveName,
        )}. ${JSON.stringify(directiveValueEntry)} should be quoted`,
      )
    : null;

const stringifyDirectiveValue = (
  directiveValue: Iterable<ContentSecurityPolicyDirectiveValue>,
): null | string => {
  if (Array.isArray(directiveValue)) {
    return directiveValue.every(isString) ? directiveValue.join(" ") : null;
  }
  if (directiveValue instanceof Set) {
    return stringifyDirectiveValue(Array.from(directiveValue));
  }
  return null;
};

const parseDirectives = ({
  useDefaults = true,
  directives: rawDirectives = {},
}: Readonly<ContentSecurityPolicyOptions>): string | ParsedDirectivesMap => {
  const result: ParsedDirectivesMap = new Map(
    useDefaults ? Object.entries(getDefaultDirectives()) : [],
  );
  let hasDisabledDefaultSrc = false;
  const directiveNamesSeen = new Set<string>();

  for (const rawDirectiveName in rawDirectives) {
    if (!Object.hasOwn(rawDirectives, rawDirectiveName)) {
      continue;
    }

    const directiveName = parseDirectiveName(rawDirectiveName);
    if (directiveNamesSeen.has(directiveName)) {
      throw new Error(
        `Content-Security-Policy received a duplicate directive ${JSON.stringify(
          directiveName,
        )}`,
      );
    }
    directiveNamesSeen.add(directiveName);

    const rawDirectiveValue = rawDirectives[rawDirectiveName];
    let directiveValue: Iterable<ContentSecurityPolicyDirectiveValue>;

    if (rawDirectiveValue === null) {
      if (directiveName === "default-src") {
        throw new Error(
          "Content-Security-Policy needs a default-src but it was set to `null`. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.",
        );
      }
      result.delete(directiveName);
      continue;
    } else if (typeof rawDirectiveValue === "string") {
      directiveValue = [rawDirectiveValue];
    } else if (rawDirectiveValue === dangerouslyDisableDefaultSrc) {
      if (directiveName === "default-src") {
        hasDisabledDefaultSrc = true;
        result.delete(directiveName);
        continue;
      } else {
        throw new Error(
          `Content-Security-Policy: tried to disable ${JSON.stringify(
            directiveName,
          )} as if it were default-src; simply omit the key`,
        );
      }
    } else if (rawDirectiveValue) {
      directiveValue = rawDirectiveValue;
    } else {
      throw new Error(
        `Content-Security-Policy received an invalid directive value for ${JSON.stringify(
          directiveName,
        )}`,
      );
    }

    for (const element of directiveValue) {
      if (typeof element !== "string") continue;
      throwErrorIfExists(
        getDirectiveValueValidationError(directiveName, element) ??
          getDirectiveValueEntryValidationError(directiveName, element),
      );
    }

    result.set(directiveName, directiveValue);
  }

  if (!result.size) {
    throw new Error(
      "Content-Security-Policy has no directives. Either set some or disable the header",
    );
  }
  if (!result.has("default-src") && !hasDisabledDefaultSrc) {
    throw new Error(
      "Content-Security-Policy needs a default-src but none was provided. If you really want to disable it, set it to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.",
    );
  }

  let stringResult = "";
  let shouldUseStringResult = true;
  for (const [directiveName, directiveValue] of result) {
    const directiveValueString = stringifyDirectiveValue(directiveValue);
    if (directiveValueString === null) {
      shouldUseStringResult = false;
      break;
    } else {
      if (stringResult) stringResult += ";";
      stringResult += directiveValueString
        ? `${directiveName} ${directiveValueString}`
        : directiveName;
    }
  }

  return shouldUseStringResult ? stringResult : result;
};

function getHeaderValue(
  req: IncomingMessage,
  res: ServerResponse,
  normalizedDirectives: Readonly<ParsedDirectivesMap>,
): string | Error {
  const result: string[] = [];

  for (const [directiveName, rawDirectiveValue] of normalizedDirectives) {
    let directiveValue = "";
    for (const element of rawDirectiveValue) {
      if (typeof element === "function") {
        let newElement: string;
        try {
          newElement = element(req, res);
        } catch (err) {
          return errify(err);
        }
        const err = getDirectiveValueEntryValidationError(
          directiveName,
          newElement,
        );
        if (err) return err;
        directiveValue += " " + newElement;
      } else {
        directiveValue += " " + element;
      }
    }

    if (directiveValue) {
      const err = getDirectiveValueValidationError(
        directiveName,
        directiveValue,
      );
      if (err) return err;
      result.push(`${directiveName}${directiveValue}`);
    } else {
      result.push(directiveName);
    }
  }

  return result.join(";");
}

const contentSecurityPolicy: ContentSecurityPolicy =
  function contentSecurityPolicy(
    options: Readonly<ContentSecurityPolicyOptions> = {},
  ): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: Error) => void,
  ) => void {
    const headerName = options.reportOnly
      ? "Content-Security-Policy-Report-Only"
      : "Content-Security-Policy";

    const parsedDirectives = parseDirectives(options);

    // A special case for performance.
    if (typeof parsedDirectives === "string") {
      return function contentSecurityPolicyMiddleware(
        _req: IncomingMessage,
        res: ServerResponse,
        next: (error?: Error) => void,
      ) {
        res.setHeader(headerName, parsedDirectives);
        next();
      };
    }

    return function contentSecurityPolicyMiddleware(
      req: IncomingMessage,
      res: ServerResponse,
      next: (error?: Error) => void,
    ) {
      const result = getHeaderValue(req, res, parsedDirectives);
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

export { dangerouslyDisableDefaultSrc, getDefaultDirectives };
