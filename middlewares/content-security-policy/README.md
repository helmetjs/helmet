# Content Security Policy middleware

The `Content-Security-Policy` header mitigates a large number of attacks, such as [cross-site scripting][XSS]. See [MDN's introductory article on Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).

This header is powerful but likely requires some configuration for your specific app.

To configure this header, pass an object with a nested `directives` object. Each key is a directive name in camel case (such as `defaultSrc`) or kebab case (such as `default-src`). Each value is an array (or other iterable) of strings or functions for that directive. If a function appears in the array, it will be called with the request and response objects.

```javascript
const contentSecurityPolicy = require("helmet-csp");

// Sets all of the defaults, but overrides `script-src`
// and disables the default `style-src`.
app.use(
  contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "example.com"],
      "style-src": null,
    },
  }),
);
```

```js
// Sets the `script-src` directive to
// "'self' 'nonce-e33cc...'"
// (or similar)
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(32).toString("hex");
  next();
});
app.use(
  contentSecurityPolicy({
    directives: {
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
    },
  }),
);
```

These directives are merged into a default policy, which you can disable by setting `useDefaults` to `false`.

```javascript
// Sets "Content-Security-Policy: default-src 'self';
// script-src 'self' example.com;object-src 'none';
// upgrade-insecure-requests"
app.use(
  contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "example.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }),
);
```

You can get the default directives object with `contentSecurityPolicy.getDefaultDirectives()`. Here is the default policy (formatted for readability):

```
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
```

The `default-src` directive can be explicitly disabled by setting its value to `contentSecurityPolicy.dangerouslyDisableDefaultSrc`, but this is not recommended.

You can set the [`Content-Security-Policy-Report-Only`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only) instead:

```javascript
// Sets the Content-Security-Policy-Report-Only header
app.use(
  contentSecurityPolicy({
    directives: {
      /* ... */
    },
    reportOnly: true,
  }),
);
```

This module performs very little validation on your CSP. You should rely on CSP checkers like [CSP Evaluator](https://csp-evaluator.withgoogle.com/) instead.
