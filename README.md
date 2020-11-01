# Helmet

[![npm version](https://badge.fury.io/js/helmet.svg)](http://badge.fury.io/js/helmet)
[![npm dependency status](https://david-dm.org/helmetjs/helmet.svg)](https://david-dm.org/helmetjs/helmet)
[![Build Status](https://travis-ci.org/helmetjs/helmet.svg?branch=master)](https://travis-ci.org/helmetjs/helmet)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fhelmetjs%2Fhelmet.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fhelmetjs%2Fhelmet?ref=badge_shield)

Helmet helps you secure your Express apps by setting various HTTP headers. _It's not a silver bullet_, but it can help!

## Quick start

First, run `npm install helmet --save` for your app. Then, in an Express app:

```js
const express = require("express");
const helmet = require("helmet");

const app = express();

app.use(helmet());

// ...
```

## How it works

Helmet is [Connect](https://github.com/senchalabs/connect)-style middleware, which is compatible with frameworks like [Express](https://expressjs.com/). (If you need support for Koa, see [`koa-helmet`](https://github.com/venables/koa-helmet).)

The top-level `helmet` function is a wrapper around 11 smaller middlewares.

In other words, these two things are equivalent:

```js
// This...
app.use(helmet());

// ...is equivalent to this:
app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
```

To set custom options for one of the middleware, add options like this:

```js
// This sets custom options for the `referrerPolicy` middleware.
app.use(
  helmet({
    referrerPolicy: { policy: "no-referrer" },
  })
);
```

You can also disable a middleware:

```js
// This disables the `contentSecurityPolicy` middleware but keeps the rest.
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
```

## Reference

<details>
<summary><code>helmet(options)</code></summary>

Helmet is the top-level middleware for this module, including all 11 others.

All 11 middlewares are enabled by default.

```js
// Includes all 11 middlewares
app.use(helmet());
```

If you want to disable one, pass options to `helmet`. For example, to disable `frameguard`:

```js
// Includes 10 middlewares, skipping `helmet.frameguard`
app.use(
  helmet({
    frameguard: false,
  })
);
```

Most of the middlewares have options, which are documented in more detail below. For example, to pass `{ action: "deny" }` to `frameguard`:

```js
// Includes all 11 middlewares, setting an option for `helmet.frameguard`
app.use(
  helmet({
    frameguard: {
      action: "deny",
    },
  })
);
```

Each middleware's name is listed below.

</details>

<details>
<summary><code>helmet.contentSecurityPolicy(options)</code></summary>

`helmet.contentSecurityPolicy` sets the `Content-Security-Policy` header which helps mitigate cross-site scripting attacks, among other things. See [MDN's introductory article on Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).

This middleware performs very little validation. You should rely on CSP checkers like [CSP Evaluator](https://csp-evaluator.withgoogle.com/) instead.

`options.directives` is an object. Each key is a directive name in camel case (such as `defaultSrc`) or kebab case (such as `default-src`). Each value is an iterable (usually an array) of strings or functions for that directive. If a function appears in the iterable, it will be called with the request and response.

`options.reportOnly` is a boolean, defaulting to `false`. If `true`, [the `Content-Security-Policy-Report-Only` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only) will be set instead.

If no directives are supplied, the following policy is set (whitespace added for readability):

    default-src 'self';
    base-uri 'self';
    block-all-mixed-content;
    font-src 'self' https: data:;
    frame-ancestors 'self';
    img-src 'self' data:;
    object-src 'none';
    script-src 'self';
    script-src-attr 'none';
    style-src 'self' https: 'unsafe-inline';
    upgrade-insecure-requests

You can fetch this default with `helmet.contentSecurityPolicy.getDefaultDirectives()`.

Examples:

```js
// Sets "Content-Security-Policy: default-src 'self';script-src 'self' example.com;object-src 'none';upgrade-insecure-requests"
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "example.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Sets "Content-Security-Policy: default-src 'self';script-src 'self' example.com;object-src 'none'"
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "example.com"],
      "object-src": ["'none'"],
    },
  })
);

// Sets all of the defaults, but overrides script-src
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "example.com"],
    },
  })
);

// Sets the "Content-Security-Policy-Report-Only" header instead
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      /* ... */
    },
    reportOnly: true,
  })
);

// Sets "Content-Security-Policy: default-src 'self';script-src 'self' 'nonce-e33ccde670f149c1789b1e1e113b0916'"
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
    },
  })
);
```

You can install this module separately as `helmet-csp`.

</details>

<details>
<summary><code>helmet.expectCt(options)</code></summary>

`helmet.expectCt` sets the `Expect-CT` header which helps mitigate misissued SSL certificates. See [MDN's article on Certificate Transparency](https://developer.mozilla.org/en-US/docs/Web/Security/Certificate_Transparency) and the [`Expect-CT` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT) for more.

`options.maxAge` is the number of seconds to expect Certificate Transparency. It defaults to `0`.

`options.enforce` is a boolean. If `true`, the user agent (usually a browser) should refuse future connections that violate its Certificate Transparency policy. Defaults to `false`.

`options.reportUri` is a string. If set, complying user agents will report Certificate Transparency failures to this URL. Unset by default.

Examples:

```js
// Sets "Expect-CT: max-age=86400"
app.use(
  helmet.expectCt({
    maxAge: 86400,
  })
);

// Sets "Expect-CT: max-age=86400, enforce, report-uri="https://example.com/report"
app.use(
  helmet.expectCt({
    maxAge: 86400,
    enforce: true,
    reportUri: "https://example.com/report",
  })
);
```

You can install this module separately as `expect-ct`.

</details>

<details>
<summary><code>helmet.referrerPolicy(options)</code></summary>

`helmet.referrerPolicy` sets the `Referrer-Policy` header which controls what information is set in [the `Referer` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer). See ["Referer header: privacy and security concerns"](https://developer.mozilla.org/en-US/docs/Web/Security/Referer_header:_privacy_and_security_concerns) and [the header's documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy) on MDN for more.

`options.policy` is a string or array of strings representing the policy. If passed as an array, it will be joined with commas, which is useful when setting [a fallback policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy#Specifying_a_fallback_policy). It defaults to `no-referrer`.

Examples:

```js
// Sets "Referrer-Policy: no-referrer"
app.use(
  helmet.referrerPolicy({
    policy: "no-referrer",
  })
);

// Sets "Referrer-Policy: origin,unsafe-url"
app.use(
  helmet.referrerPolicy({
    policy: ["origin", "unsafe-url"],
  })
);
```

You can install this module separately as `referrer-policy`.

</details>

<details>
<summary><code>helmet.hsts(options)</code></summary>

`helmet.hsts` sets the `Strict-Transport-Security` header which tells browsers to prefer HTTPS over insecure HTTP. See [the documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) for more.

`options.maxAge` is the number of seconds browsers should remember to prefer HTTPS. If passed a non-integer, the value is rounded down. It defaults to `15552000`, which is 180 days.

`options.includeSubDomains` is a boolean which dictates whether to include the `includeSubDomains` directive, which makes this policy extend to subdomains. It defaults to `true`.

`options.preload` is a boolean. If true, it adds the `preload` directive, expressing intent to add your HSTS policy to browsers. See [the "Preloading Strict Transport Security" section on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#Preloading_Strict_Transport_Security) for more. It defaults to `false`.

Examples:

```js
// Sets "Strict-Transport-Security: max-age=123456; includeSubDomains"
app.use(
  helmet.hsts({
    maxAge: 123456,
  })
);

// Sets "Strict-Transport-Security: max-age=123456"
app.use(
  helmet.hsts({
    maxAge: 123456,
    includeSubDomains: false,
  })
);

// Sets "Strict-Transport-Security: max-age=123456; includeSubDomains; preload"
app.use(
  helmet.hsts({
    maxAge: 63072000,
    preload: true,
  })
);
```

You can install this module separately as `hsts`.

</details>

<details>
<summary><code>helmet.noSniff()</code></summary>

`helmet.noSniff` sets the `X-Content-Type-Options` header to `nosniff`. This mitigates [MIME type sniffing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#MIME_sniffing) which can cause security vulnerabilities. See [documentation for this header on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options) for more.

This middleware takes no options.

Example:

```js
// Sets "X-Content-Type-Options: nosniff"
app.use(helmet.noSniff());
```

You can install this module separately as `dont-sniff-mimetype`.

</details>

<details>
<summary><code>helmet.dnsPrefetchControl(options)</code></summary>

`helmet.dnsPrefetchControl` sets the `X-DNS-Prefetch-Control` header to help control DNS prefetching, which can improve user privacy at the expense of performance. See [documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control) for more.

`options.allow` is a boolean dictating whether to enable DNS prefetching. It defaults to `false`.

Examples:

```js
// Sets "X-DNS-Prefetch-Control: off"
app.use(
  helmet.dnsPrefetchControl({
    allow: false,
  })
);

// Sets "X-DNS-Prefetch-Control: on"
app.use(
  helmet.dnsPrefetchControl({
    allow: true,
  })
);
```

You can install this module separately as `dns-prefetch-control`.

</details>

<details>
<summary><code>helmet.ieNoOpen()</code></summary>

`helmet.ieNoOpen` sets the `X-Download-Options` header, which is specific to Internet Explorer 8. It forces potentially-unsafe downloads to be saved, mitigating execution of HTML in your site's context. For more, see [this old post on MSDN](https://docs.microsoft.com/en-us/archive/blogs/ie/ie8-security-part-v-comprehensive-protection).

This middleware takes no options.

Examples:

```js
// Sets "X-Download-Options: noopen"
app.use(helmet.ieNoOpen());
```

You can install this module separately as `ienoopen`.

</details>

<details>
<summary><code>helmet.frameguard(options)</code></summary>

`helmet.frameguard` sets the `X-Frame-Options` header to help you mitigate [clickjacking attacks](https://en.wikipedia.org/wiki/Clickjacking). This header is superseded by [the `frame-ancestors` Content Security Policy directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors) but is still useful on old browsers. For more, see [the documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options).

`options.action` is a string that specifies which directive to use—either `DENY` or `SAMEORIGIN`. (A legacy directive, `ALLOW-FROM`, is not supported by this middleware. [Read more here.](https://github.com/helmetjs/helmet/wiki/How-to-use-X%E2%80%93Frame%E2%80%93Options's-%60ALLOW%E2%80%93FROM%60-directive)) It defaults to `SAMEORIGIN`.

Examples:

```js
// Sets "X-Frame-Options: DENY"
app.use(
  helmet.frameguard({
    action: "deny",
  })
);

// Sets "X-Frame-Options: SAMEORIGIN"
app.use(
  helmet.frameguard({
    action: "sameorigin",
  })
);
```

You can install this module separately as `frameguard`.

</details>

<details>
<summary><code>helmet.permittedCrossDomainPolicies(options)</code></summary>

`helmet.permittedCrossDomainPolicies` sets the `X-Permitted-Cross-Domain-Policies` header, which tells some clients (mostly Adobe products) your domain's policy for loading cross-domain content. See [the description on OWASP](https://owasp.org/www-project-secure-headers/) for more.

`options.permittedPolicies` is a string that must be `"none"`, `"master-only"`, `"by-content-type"`, or `"all"`. It defaults to `"none"`.

Examples:

```js
// Sets "X-Permitted-Cross-Domain-Policies: none"
app.use(
  helmet.permittedCrossDomainPolicies({
    permittedPolicies: "none",
  })
);

// Sets "X-Permitted-Cross-Domain-Policies: by-content-type"
app.use(
  helmet.permittedCrossDomainPolicies({
    permittedPolicies: "by-content-type",
  })
);
```

You can install this module separately as `helmet-crossdomain`.

</details>

<details>
<summary><code>helmet.hidePoweredBy()</code></summary>

`helmet.hidePoweredBy` removes the `X-Powered-By` header, which is set by default in some frameworks (like Express). Removing the header offers very limited security benefits (see [this discussion](https://github.com/expressjs/express/pull/2813#issuecomment-159270428)) and is mostly removed to save bandwidth.

This middleware takes no options.

If you're using Express, this middleware will work, but you should use `app.disable("x-powered-by")` instead.

Examples:

```js
// Removes the X-Powered-By header if it was set.
app.use(helmet.hidePoweredBy());
```

You can install this module separately as `hide-powered-by`.

</details>

<details>
<summary><code>helmet.xssFilter()</code></summary>

`helmet.xssFilter` disables browsers' buggy cross-site scripting filter by setting the `X-XSS-Protection` header to `0`. See [discussion about disabling the header here](https://github.com/helmetjs/helmet/issues/230) and [documentation on MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection).

This middleware takes no options.

Examples:

```js
// Sets "X-XSS-Protection: 0"
app.use(helmet.xssFilter());
```

You can install this module separately as `x-xss-protection`.

</details>
