import { IncomingMessage, ServerResponse } from "http";

export const dangerouslyDisableDefaultSrc = Symbol(
  "dangerouslyDisableDefaultSrc"
);

export type GetDefaultDirectives = () => Record<
  string,
  Iterable<ContentSecurityPolicyDirectiveValue>
>;

export type ContentSecurityPolicyDirectiveValueFunction = (
  req: IncomingMessage,
  res: ServerResponse
) => string;

export type ContentSecurityPolicyDirectiveValue =
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

export type NormalizedDirectives = Map<
  string,
  Iterable<ContentSecurityPolicyDirectiveValue>
>;

export interface ContentSecurityPolicy {
  (options?: Readonly<ContentSecurityPolicyOptions>): (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: Error) => void
  ) => void;
  getDefaultDirectives: GetDefaultDirectives;
  dangerouslyDisableDefaultSrc: typeof dangerouslyDisableDefaultSrc;
}
