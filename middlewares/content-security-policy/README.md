# Content Security Policy middleware

Content Security Policy (CSP) helps prevent unwanted content from being injected/loaded into your webpages. This can mitigate cross-site scripting (XSS) vulnerabilities, clickjacking, formjacking, malicious frames, unwanted trackers, and other web client-side attacks.

If you want to learn how CSP works, check out the fantastic [HTML5 Rocks guide](https://www.html5rocks.com/en/tutorials/security/content-security-policy/), the [Content Security Policy Reference](https://content-security-policy.com/), and the [Content Security Policy specification](https://www.w3.org/TR/CSP/).

This middleware helps set Content Security Policies.

Basic usage:

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
  })
);
```

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

You can set any directives you wish. `defaultSrc` is required, but can be explicitly disabled by setting its value to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`. Directives can be kebab-cased (like `script-src`) or camel-cased (like `scriptSrc`). They are equivalent, but duplicates are not allowed.

The `reportOnly` option, if set to `true`, sets the `Content-Security-Policy-Report-Only` header instead. If you want to set _both_ the normal and `Report-Only` headers, see [this code snippet](https://github.com/helmetjs/helmet/issues/351#issuecomment-1015498560).

This middleware does minimal validation. You should use a more sophisticated CSP validator, like [Google's CSP Evaluator](https://csp-evaluator.withgoogle.com/), to make sure your CSP looks good.

## Recipe: generating nonces

You can dynamically generate nonces to allow inline `<script>` tags to be safely evaluated. Here's a simple example:

```js
const crypto = require("crypto");
const contentSecurityPolicy = require("helmet-csp");

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("hex");
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
