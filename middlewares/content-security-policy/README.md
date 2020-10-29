# Content Security Policy middleware

Content Security Policy helps prevent unwanted content being injected into your webpages. This can mitigate cross-site scripting (XSS) vulnerabilities, malicious frames, unwanted trackers, and much more.

If you want to learn how CSP works, check out the fantastic [HTML5 Rocks guide](http://www.html5rocks.com/en/tutorials/security/content-security-policy/), the [Content Security Policy Reference](http://content-security-policy.com/), and the [Content Security Policy specification](http://www.w3.org/TR/CSP/).

This middleware helps set Content Security Policies.

Basic usage:

```javascript
const contentSecurityPolicy = require("helmet-csp");

app.use(
  contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "default.example"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  })
);
```

To get the defaults, use `contentSecurityPolicy.getDefaultDirectives()`.

You can set any directives you wish. `defaultSrc` is required. Directives can be kebab-cased (like `script-src`) or camel-cased (like `scriptSrc`). They are equivalent, but duplicates are not allowed.

The `reportOnly` option, if set to `true`, sets the `Content-Security-Policy-Report-Only` header instead.

This middleware does minimal validation. You should use a more sophisticated CSP validator, like [Google's CSP Evaluator](https://csp-evaluator.withgoogle.com/), to make sure your CSP looks good.

## Recipe: generating nonces

You can dynamically generate nonces to allow inline `<script>` tags to be safely evaluated. Here's a simple example:

```js
const crypto = require("crypto");

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("hex");
  next();
});

app.use((req, res, next) => {
  csp({
    directives: {
      defaultSrc: ["'self'"],
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
- [GitHub's CSP journey](http://githubengineering.com/githubs-csp-journey/)
- [Content Security Policy for Single Page Web Apps](https://developer.squareup.com/blog/content-security-policy-for-single-page-web-apps/)
