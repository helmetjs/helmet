Helmet
======
[![Gitter chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/helmetjs/helmet)
[![npm version](https://badge.fury.io/js/helmet.svg)](http://badge.fury.io/js/helmet)
[![npm dependency status](https://david-dm.org/helmetjs/helmet.svg)](https://david-dm.org/helmetjs/helmet)
[![Build Status](https://travis-ci.org/helmetjs/helmet.svg?branch=master)](https://travis-ci.org/helmetjs/helmet)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Helmet helps you secure your Express apps by setting various HTTP headers. *It's not a silver bullet*, but it can help!

[Looking for a version of Helmet that supports the Koa framework?](https://github.com/venables/koa-helmet)

Quick start
-----------

First, run `npm install helmet --save` for your app. Then, in an Express (or Connect) app:

```js
var express = require('express')
var helmet = require('helmet')

var app = express()

app.use(helmet())

// ...
```

You can also use its pieces individually:

```js
app.use(helmet.noCache())
app.use(helmet.frameguard())
```

*If you're using Express 3, make sure these middlewares are listed before `app.router`.*

How it works
------------

Helmet is a collection of 11 smaller middleware functions that set HTTP headers. Running `app.use(helmet())` will not include all of these middleware functions by default.

| Module | Default? |
|---|---|
| [contentSecurityPolicy](https://github.com/helmetjs/csp) for setting Content Security Policy |  |
| [dnsPrefetchControl](https://github.com/helmetjs/dns-prefetch-control) controls browser DNS prefetching | ✓ |
| [frameguard](https://github.com/helmetjs/frameguard) to prevent clickjacking | ✓ |
| [hidePoweredBy](https://github.com/helmetjs/hide-powered-by) to remove the X-Powered-By header | ✓ |
| [hpkp](https://github.com/helmetjs/hpkp) for HTTP Public Key Pinning |  |
| [hsts](https://github.com/helmetjs/hsts) for HTTP Strict Transport Security | ✓ |
| [ieNoOpen](https://github.com/helmetjs/ienoopen) sets X-Download-Options for IE8+ | ✓ |
| [noCache](https://github.com/helmetjs/nocache) to disable client-side caching |  |
| [noSniff](https://github.com/helmetjs/dont-sniff-mimetype) to keep clients from sniffing the MIME type | ✓ |
| [referrerPolicy](https://github.com/helmetjs/referrer-policy) to hide the Referer header |  |
| [xssFilter](https://github.com/helmetjs/x-xss-protection) adds some small XSS protections | ✓ |

You can also use each module individually as documented below.

Usage guide
-----------

For each of the middlewares, we'll talk about three things:

1. What's the attack we're trying to prevent?
2. How do we use Helmet to help mitigate those issues?
3. What are the non-obvious limitations of this middleware?

Let's get started.

### Top-level: helmet

The top-level `helmet` package will include 7 of the following 11 packages. You can use it like this:

```js
app.use(helmet())
```

You can disable a middleware that's normally enabled by default. This will disable `frameguard` but include the other 6 defaults.

```js
app.use(helmet({
  frameguard: false
}))
```

You can also set options for a middleware. Setting options like this will *always* include the middleware, whether or not it's a default.

```js
app.use(helmet({
  frameguard: {
    action: 'deny'
  }
}))
```

### Content Security Policy: contentSecurityPolicy

**Trying to prevent:** Injecting anything unintended into our page. That could cause XSS vulnerabilities, unintended tracking, malicious frames, and more.

**How to use Helmet to mitigate this:** Set an appropriate Content Security Policy. If you want to learn how CSP works, check out the fantastic [HTML5 Rocks guide](http://www.html5rocks.com/en/tutorials/security/content-security-policy/) and the [Content Security Policy Reference](http://content-security-policy.com/).

Usage:

```javascript
app.use(helmet.contentSecurityPolicy({
  // Specify directives as normal.
  directives: {
    defaultSrc: ["'self'", 'default.com'],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ['style.com'],
    imgSrc: ['img.com', 'data:'],
    sandbox: ['allow-forms', 'allow-scripts'],
    reportUri: '/report-violation',
    objectSrc: [] // An empty array allows nothing through
  },

  // Set to true if you only want browsers to report errors, not block them
  reportOnly: false,

  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: false,

  // Set to true if you want to disable CSP on Android where it can be buggy.
  disableAndroid: false,

  // Set to false if you want to completely disable any user-agent sniffing.
  // This may make the headers less compatible but it will be much faster.
  // This defaults to `true`.
  browserSniff: true
}))
```

You can specify keys in a camel-cased fashion (`imgSrc`) or dashed (`img-src`); they are equivalent.

There are a lot of inconsistencies in how browsers implement CSP. Helmet sniffs the user-agent of the browser and sets the appropriate header and value for that browser. If no user-agent is matched, it will set _all_ the headers with the latest spec.

*Note*: If you're using the `reportUri` feature and you're using [csurf](https://github.com/expressjs/csurf), you might have errors. [Check this out](https://github.com/expressjs/csurf/issues/20) for a workaround.

**Limitations:** CSP is often difficult to tune properly, as it's a whitelist and not a blacklist. It isn't supported on old browsers but is [pretty well-supported](http://caniuse.com/#feat=contentsecuritypolicy) on newer browsers.

### XSS Filter: xssFilter

**Trying to prevent:** Cross-site scripting attacks (XSS), a subset of the attacks mentioned above.

**How to use Helmet to mitigate this:** The `X-XSS-Protection` HTTP header is a basic protection against XSS. It was originally [by Microsoft](http://blogs.msdn.com/b/ieinternals/archive/2011/01/31/controlling-the-internet-explorer-xss-filter-with-the-x-xss-protection-http-header.aspx) but Chrome has since adopted it as well. Helmet lets you use it easily:

```javascript
app.use(helmet.xssFilter())
```

This sets the `X-XSS-Protection` header. On modern browsers, it will set the value to `1; mode=block`. On old versions of Internet Explorer, this creates a vulnerability (see [here](http://hackademix.net/2009/11/21/ies-xss-filter-creates-xss-vulnerabilities/) and [here](http://technet.microsoft.com/en-us/security/bulletin/MS10-002)), and so the header is set to `0` to disable it. To force the header on all versions of IE, add the option:

```javascript
app.use(helmet.xssFilter({ setOnOldIE: true }))
// This has some security problems for old IE!
```

**Limitations:** This isn't anywhere near as thorough as CSP. It's only properly supported on IE9+ and Chrome; no other major browsers support it at this time. Old versions of IE support it in a buggy way, which we disable by default.

### Frame options: frameguard

**Trying to prevent:** Your page being put in a `<frame>` or `<iframe>` without your consent. This can result in [clickjacking attacks](https://en.wikipedia.org/wiki/Clickjacking), among other things.

**How to use Helmet to mitigate this:** The `X-Frame-Options` HTTP header restricts who can put your site in a frame which can help mitigate things like [clickjacking attacks](https://en.wikipedia.org/wiki/Clickjacking). It has three modes: `DENY`, `SAMEORIGIN`, and `ALLOW-FROM`, defaulting to `SAMEORIGIN`. If your app does not need to be framed (and most don't) you can use `DENY`. If your site can be in frames from the same origin, you can set it to `SAMEORIGIN`. If you want to allow it from a specific URL, you can allow that with `ALLOW-FROM` and a URL.

Usage:

```javascript
// Don't allow me to be in ANY frames:
app.use(helmet.frameguard({ action: 'deny' }))

// Only let me be framed by people of the same origin:
app.use(helmet.frameguard({ action: 'sameorigin' }))
app.use(helmet.frameguard())  // defaults to sameorigin

// Allow from a specific host:
app.use(helmet.frameguard({
  action: 'allow-from',
  domain: 'http://example.com'
}))
```

**Limitations:** This has pretty good (but not 100%) browser support: IE8+, Opera 10.50+, Safari 4+, Chrome 4.1+, and Firefox 3.6.9+. It only prevents against a certain class of attack, but does so pretty well. It also prevents your site from being framed, which you might want for legitimate reasons.

### HTTP Strict Transport Security: hsts

**Trying to prevent:** Users viewing your site on HTTP instead of HTTPS. HTTP is pretty insecure!

**How to use Helmet to mitigate this:** This middleware adds the `Strict-Transport-Security` header to the response. This tells browsers, "hey, only use HTTPS for the next period of time". ([See the spec](http://tools.ietf.org/html/rfc6797) for more.)

This will set the Strict Transport Security header, telling browsers to visit by HTTPS for the next ninety days:

```javascript
var ninetyDaysInMilliseconds = 7776000000;
app.use(helmet.hsts({ maxAge: ninetyDaysInMilliseconds }))
```

You can also include subdomains. If this is set on *example.com*, supported browsers will also use HTTPS on *my-subdomain.example.com*. Here's how you do that:

```javascript
app.use(helmet.hsts({
  maxAge: 123000,
  includeSubdomains: true
}))
```

Chrome lets you submit your site for baked-into-Chrome HSTS by adding `preload` to the header. You can add that with the following code, and then submit your site to the Chrome team at [hstspreload.appspot.com](https://hstspreload.appspot.com/).

```javascript
app.use(helmet.hsts({
  maxAge: 10886400000,     // Must be at least 18 weeks to be approved by Google
  includeSubdomains: true, // Must be enabled to be approved by Google
  preload: true
}))
```

This'll be set if `req.secure` is true, a boolean auto-populated by Express. If you're not using Express, that value won't necessarily be set, so you have two options:

```javascript
// Set the header based on silly conditions
app.use(helmet.hsts({
  maxAge: 1234000,
  setIf: function(req, res) {
    return Math.random() < 0.5;
  }
}));

// ALWAYS set the header
app.use(helmet.hsts({
  maxAge: 1234000,
  force: true
}))
```

Note that the max age is in milliseconds, even though the spec uses seconds. This middleware will round to the nearest full second.

**Limitations:** This only works if your site actually has HTTPS. It won't tell users on HTTP to *switch* to HTTPS, it will just tell HTTPS users to stick around. You can enforce this with the [express-enforces-ssl](https://github.com/aredo/express-enforces-ssl) module. It's [somewhat well-supported by browsers](http://caniuse.com/#feat=stricttransportsecurity).

### Hide the Referer header: referrerPolicy

The [Referer HTTP header](https://en.wikipedia.org/wiki/HTTP_referer) is typically set by web browsers to tell the server where it's coming from. For example, if you click a link on *example.com/index.html* that takes you to *wikipedia.org*, Wikipedia's servers will see `Referer: example.com`. This can have privacy implications—websites can see where you are coming from. The new [`Referrer-Policy` HTTP header](https://www.w3.org/TR/referrer-policy/#referrer-policy-header) lets authors control how browsers set the Referer header.

[Read the spec](https://www.w3.org/TR/referrer-policy/#referrer-policies) to see the options you can provide.

Usage:

```js
app.use(helmet.referrerPolicy({ policy: 'same-origin' }))
// Referrer-Policy: same-origin

app.use(helmet.referrerPolicy({ policy: 'unsafe-url' }))
// Referrer-Policy: unsafe-url

app.use(helmet.referrerPolicy())
// Referrer-Policy: no-referrer
```

### Hide X-Powered-By: hidePoweredBy

**Trying to prevent:** Hackers can exploit known vulnerabilities in Express/Node if they see that your site is powered by Express (or whichever framework you use). `X-Powered-By: Express` is sent in every HTTP request coming from Express by default. Disabling this won't provide much security benefit ([as discussed here](https://github.com/strongloop/express/pull/2813#issuecomment-159270428)), but might help a tiny bit. It will also improve performance by reducing the number of bytes sent.

**How to use Helmet to mitigate this:** The `hidePoweredBy` middleware will remove the `X-Powered-By` header if it is set (which it will be by default in Express).

```javascript
app.use(helmet.hidePoweredBy())
```

You can also explicitly set the header to something else, if you want. This could throw people off:

```javascript
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))
```

Note: if you're using Express, you can skip Helmet's middleware if you want:

```javascript
app.disable('x-powered-by')
```

**Limitations:** There might be other telltale signs that your site is Express-based (a blog post about your tech stack, for example). And if a hacker wants to hack your site, they could try Express (even if they're not sure that's what your site is built on).

### Internet Explorer, restrict untrusted HTML: ieNoOpen

**Trying to prevent:** Some web applications will serve untrusted HTML for download. By default, some versions of Internet Explorer will allow you to open those HTML files *in the context of your site*, which means that an untrusted HTML page could start doing bad things in the context of your pages. For more, see [this MSDN blog post](http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-v-comprehensive-protection.aspx).

**How to use Helmet to mitigate this:** Set the `X-Download-Options` header to `noopen` to prevent IE users from executing downloads in your site's context.

```javascript
app.use(helmet.ieNoOpen())
```

**Limitations:** This is pretty obscure, fixing a small bug on IE only. No real drawbacks other than performance/bandwidth of setting the headers, though.

### Don't infer the MIME type: noSniff

**Trying to prevent:** Some browsers will try to "sniff" mimetypes. For example, if my server serves *file.txt* with a *text/plain* content-type, some browsers can still run that file with `<script src="file.txt"></script>`. Many browsers will allow *file.js* to be run even if the content-type isn't for JavaScript. There are [some other vulnerabilities](http://miki.it/blog/2014/7/8/abusing-jsonp-with-rosetta-flash/), too.

**How to use Helmet to mitigate this:** Use Helmet's `noSniff` middleware to keep Chrome, Opera, and IE from doing this sniffing ([and Firefox soon](https://bugzilla.mozilla.org/show_bug.cgi?id=471020)). The following example sets the `X-Content-Type-Options` header to its only option, `nosniff`:

```javascript
app.use(helmet.noSniff())
```

[MSDN has a good description](http://msdn.microsoft.com/en-us/library/gg622941%28v=vs.85%29.aspx) of how browsers behave when this header is sent.

**Limitations:** This only prevents against a certain kind of attack.

### Turn off caching: noCache

**Trying to prevent:** Users caching your old, buggy resources. It's possible that you've got bugs in an old HTML or JavaScript file, and with a cache, some users will be stuck with those old versions.

**How to use Helmet to mitigate this:** Use Helmet to disable this kind of caching. This sets a number of HTTP headers that stop caching.

```javascript
app.use(helmet.noCache())
```

This sets four headers, disabling a lot of browser caching:

- `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
- `Pragma: no-cache`
- `Expires: 0`
- `Surrogate-Control: no-store`

**Limitations:** Caching has performance benefits, and you lose them here. It's also possible that you'll introduce new bugs and you'll wish people had old resources cached, but that's less likely.

### Public Key Pinning: hpkp

**Trying to prevent:** HTTPS certificates can be forged, allowing man-in-the middle attacks. [HTTP Public Key Pinning](https://developer.mozilla.org/en-US/docs/Web/Security/Public_Key_Pinning) aims to help that.

**How to use Helmet to mitigate this:** Pass the "Public-Key-Pins" header to better assert your SSL certificates. [See the spec](https://tools.ietf.org/html/draft-ietf-websec-key-pinning-21) for more.

```javascript
var ninetyDaysInMilliseconds = 7776000000;
app.use(helmet.hpkp({
  maxAge: ninetyDaysInMilliseconds,
  sha256s: ['AbCdEf123=', 'ZyXwVu456='],
  includeSubdomains: true,         // optional
  reportUri: 'http://example.com'  // optional
  reportOnly: false,               // optional

  // Set the header based on a condition.
  // This is optional.
  setIf: function (req, res) {
    return req.secure
  }
}))
```

Setting `reportOnly` to `true` will change the header from `Public-Key-Pins` to `Public-Key-Pins-Report-Only`.

**Limitations:** Don't let these get out of sync with your certs!

### Prevent DNS prefetching: dnsPrefetchControl

**Trying to prevent:** Some browsers can start doing DNS lookups of other domains before visiting those domains. This can improve performance but can worsen security. [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/HTTP/Controlling_DNS_prefetching) describes how browsers do this prefetching. [Chromium's documentation](https://dev.chromium.org/developers/design-documents/dns-prefetching) describes some ways that DNS lookups can be abused.

**How to use Helmet to mitigate this:** Browsers will listen for the `X-DNS-Prefetch-Control` header and will disable DNS prefetching if the header is set to `off`.

```js
// Disable DNS prefetching (these two lines are equivalent):
app.use(helmet.dnsPrefetchControl())
app.use(helmet.dnsPrefetchControl({ allow: false }))

// Enable DNS prefetching (less secure but faster):
app.use(helmet.dnsPrefetchControl({ allow: true }))
```

**Limitations:** This hurts performance—browsers will no longer prefetch resources from your site.

Other recommended modules
-------------------------

Helmet only deals with HTTP headers, but there are a number of other helpful security modules for Express. We haven't heavily audited these—that's what the [Node Security Project](https://nodesecurity.io/) is for—but take a look at some of these modules!

* [express-enforces-ssl](https://github.com/aredo/express-enforces-ssl)
* [express-content-length-validator](https://github.com/ericmdantas/express-content-length-validator)
* [hpp](https://www.npmjs.com/package/hpp)
* [cors](https://www.npmjs.org/package/cors)

This module has also been ported to other environments.

* Koa Node web framework: [koa-helmet](https://github.com/venables/koa-helmet)
* Crystal programming language: [crystal-helmet](https://github.com/EvanHahn/crystal-helmet)
