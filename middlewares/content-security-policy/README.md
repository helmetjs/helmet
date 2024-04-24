# Content Security Policy middleware

Content Security Policy (CSP) helps prevent unwanted content from being injected/loaded into your webpages. This can mitigate cross-site scripting (XSS) vulnerabilities, clickjacking, formjacking, malicious frames, unwanted trackers, and other web client-side attacks.

If you want to learn how CSP works, check out the fantastic [web.dev guide](https://web.dev/articles/csp), the [Content Security Policy Reference](https://content-security-policy.com/), and the [Content Security Policy specification](https://www.w3.org/TR/CSP/).

This middleware helps set Content Security Policies.

## Basic usage

```javascript
const contentSecurityPolicy = require("helmet-csp");

app.use(
  contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'", "default.example"],
      scriptSrc: ["'self'", "js.example.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  }),
);
```

Directives can be kebab-cased (like `script-src`) or camel-cased (like `scriptSrc` in the example above). They are equivalent, but duplicates are not allowed.

Directive array items can be set to `string`, `null` to [disable them](#disabling-specific-directives), or a function to [compute them at request-time](#computed-directives). To experiment with different directives before actually enforcing them, see [Content-Security-Policy-Report-Only](#content-security-policy-report-only)

For helmet v7 and earlier, non-hostname values like `'self'`,`'none'`,`'nonce-abc123'` need to be explicitly quoted within the string.

This middleware does minimal validation. You should use a more sophisticated CSP validator, like [Google's CSP Evaluator](https://csp-evaluator.withgoogle.com/), to make sure your CSP looks good.

## Defaults

If no directives are supplied, the following policy is set (whitespace added for readability):

    default-src 'self';
    base-uri 'self';
    font-src 'self' https: data:;
    form-action 'self';
    frame-ancestors 'self';
    img-src 'self' data:;
    object-src 'none';
    script-src 'self';
    script-src-attr 'none';
    style-src 'self' https: 'unsafe-inline';
    upgrade-insecure-requests

You can use this default with the `useDefaults` option. `useDefaults` is `true` by default.

You can also get the default directives object with `contentSecurityPolicy.getDefaultDirectives()`.

You can set any directives you wish. `defaultSrc` is required when `useDefaults` is `false`, else `defaultSrc` will default to `'self'`.

## Computed directives

Each directive can be also be fully or partially computed at request time. A directive array item can be a `Function` with the signature `(req: Request, res: Response) => string`.
The example below only allows loading from a third-party CDN on HTML pages:

```javascript
const allowCdnjsOnHtmlPages = (req, res) => {
  if (req.path.endsWith(".html") && req.accepts("html"))
    return "cdnjs.cloudflare.com";
  return "";
};

app.use(
  contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", allowCdnjsOnHtmlPages],
    },
  }),
);
```

## Disabling specific directives

A single directive can be disabled by setting its value to `null`, except for `default-src`. In the unlikely event that you would need to disable `default-src` its value should be set to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`.

```javascript
app.use(
  contentSecurityPolicy({
    directives: {
      // no CSP for scripts
      scriptSrc: null,
      // are you sure about this?
      defaultSrc: contentSecurityPolicy.dangerouslyDisableDefaultSrc,
    },
  }),
);
```

## Content-Security-Policy-Report-Only

The `reportOnly` option, if set to `true`, sets the [`Content-Security-Policy-Report-Only` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only) instead. If you want to set _both_ the normal and `Report-Only` headers, see [this code snippet](https://github.com/helmetjs/helmet/issues/351#issuecomment-1015498560).

## Recipe: generating hashes

You can generate script hashes as [subresource-integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) to allow inline scripts when `script-src` does not allow `'unsafe-inline'`, or to load specific scripts from third-parties. In the example below a serviceWorker registration inline script loaded in document `<head>` is whitelisted:

```js
const crypto = require("crypto");
const contentSecurityPolicy = require("helmet-csp");
const serviceWorkerSetup =
  "navigator && navigator.serviceWorker && navigator.serviceWorker.register('/serviceWorker.js')";
const serviceWorkerHash = crypto.createHash("sha256");

serviceWorkerHash.update(serviceWorkerSetup);

const serviceWorkerIntegrity = `'sha256-${serviceWorkerHash.digest("base64")}'`;

app.use(
  contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", serviceWorkerIntegrity],
    },
  }),
);
```

## Recipe: generating nonces

You can dynamically generate nonces to allow inline `<script>` tags to be safely evaluated. Here's a simple example:

```js
const crypto = require("crypto");
const contentSecurityPolicy = require("helmet-csp");

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(32).toString("hex");
  next();
});

app.use((req, res, next) => {
  contentSecurityPolicy({
    useDefaults: true,
    directives: {
      scriptSrc: ["'self'", `'nonce-${res.locals.nonce}'`],
    },
  })(req, res, next);
});

app.use((req, res) => {
  res.end(`<script nonce="${res.locals.nonce}">alert(1 + 1);</script>`);
});
```

## See also

- [Google's CSP Evaluator tool](https://csp-evaluator.withgoogle.com/)
- [CSP Scanner](https://cspscanner.com/)
- [GitHub's CSP journey](https://githubengineering.com/githubs-csp-journey/)
- [Content Security Policy for Single Page Web Apps](https://developer.squareup.com/blog/content-security-policy-for-single-page-web-apps/)
