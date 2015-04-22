Helmet
======

[![npm version](https://badge.fury.io/js/helmet.svg)](http://badge.fury.io/js/helmet)
[![npm dependency status](https://david-dm.org/helmetjs/helmet.png)](https://david-dm.org/helmetjs/helmet)
[![Build Status](https://travis-ci.org/helmetjs/helmet.svg?branch=master)](https://travis-ci.org/helmetjs/helmet)

Helmet helps you secure your Express apps by setting various HTTP headers. *It's not a silver bullet*, but it can help!

Quick start
-----------

First, run `npm install helmet --save` for your app. Then, in an Express (or Connect) app:

```js
var express = require('express');
var helmet = require('helmet');

var app = express();

app.use(helmet());

// ...
```

You can also use its pieces individually:

```js
app.use(helmet.noCache());
app.use(helmet.frameguard());
```

*If you're using Express 3, make sure these middlewares are listed before `app.router`.*

How it works
------------

Helmet is really just a collection of 9 smaller middleware functions that set HTTP headers:

- [contentSecurityPolicy](https://github.com/helmetjs/csp) for setting Content Security Policy
- [hidePoweredBy](https://github.com/helmetjs/hide-powered-by) to remove the X-Powered-By header
- [hpkp](https://github.com/helmetjs/hpkp) for HTTP Public Key Pinning
- [hsts](https://github.com/helmetjs/hsts) for HTTP Strict Transport Security
- [ieNoOpen](https://github.com/helmetjs/ienoopen) sets X-Download-Options for IE8+
- [noCache](https://github.com/helmetjs/nocache) to disable client-side caching
- [noSniff](https://github.com/helmetjs/dont-sniff-mimetype) to keep clients from sniffing the MIME type
- [frameguard](https://github.com/helmetjs/frameguard) to prevent clickjacking
- [xssFilter](https://github.com/helmetjs/x-xss-protection) adds some small XSS protections

Running `app.use(helmet())` will include 6 of the 9, leaving out `contentSecurityPolicy`, `hpkp`, and `noCache`. You can also use each module individually, as documented below.

Usage guide
-----------

For each of the middlewares, we'll talk about three things:

1. What's the attack we're trying to prevent?
2. How do we use Helmet to help mitigate those issues?
3. What are the non-obvious limitations of this middleware?

Let's get started.

### Content Security Policy: contentSecurityPolicy

**Trying to prevent:** Injecting anything unintended into our page. That could cause XSS vulnerabilities, unintended tracking, malicious frames, and more.

**How to use Helmet to mitigate this:** Set an appropriate Content Security Policy. If you want to learn how CSP works, check out the fantastic [HTML5 Rocks guide](http://www.html5rocks.com/en/tutorials/security/content-security-policy/) and the [Content Security Policy Reference](http://content-security-policy.com/).

Usage:

```javascript
app.use(helmet.contentSecurityPolicy({
  defaultSrc: ["'self'", 'default.com'],
  scriptSrc: ['scripts.com'],
  styleSrc: ['style.com'],
  imgSrc: ['img.com'],
  connectSrc: ['connect.com'],
  fontSrc: ['font.com'],
  objectSrc: ['object.com'],
  mediaSrc: ['media.com'],
  frameSrc: ['frame.com'],
  sandbox: ['allow-forms', 'allow-scripts'],
  reportUri: '/report-violation',
  reportOnly: false, // set to true if you only want to report errors
  setAllHeaders: false, // set to true if you want to set all headers
  disableAndroid: false, // set to true if you want to disable Android (browsers can vary and be buggy)
  safari5: false // set to true if you want to force buggy CSP in Safari 5
}));
```

You can specify keys in a camel-cased fashion (`imgSrc`) or dashed (`img-src`); they are equivalent.

There are a lot of inconsistencies in how browsers implement CSP. Helmet sniffs the user-agent of the browser and sets the appropriate header and value for that browser. If no user-agent is matched, it will set _all_ the headers with the 1.0 spec.

*Note*: If you're using the `reportUri` feature and you're using [csurf](https://github.com/expressjs/csurf), you might have errors. [Check this out](https://github.com/expressjs/csurf/issues/20) for a workaround.

**Limitations:** CSP is often difficult to tune properly, as it's a whitelist and not a blacklist. It isn't supported on old browsers but is [pretty well-supported](http://caniuse.com/#feat=contentsecuritypolicy) on non-IE browsers nowadays.

### XSS Filter: xssFilter

**Trying to prevent:** Cross-site scripting attacks (XSS), a subset of the above.

**How to use Helmet to mitigate this:** The `X-XSS-Protection` HTTP header is a basic protection against XSS. It was originally [by Microsoft](http://blogs.msdn.com/b/ieinternals/archive/2011/01/31/controlling-the-internet-explorer-xss-filter-with-the-x-xss-protection-http-header.aspx) but Chrome has since adopted it as well. Helmet lets you use it easily:

```javascript
app.use(helmet.xssFilter());
```

This sets the `X-XSS-Protection` header. On modern browsers, it will set the value to `1; mode=block`. On old versions of Internet Explorer, this creates a vulnerability (see [here](http://hackademix.net/2009/11/21/ies-xss-filter-creates-xss-vulnerabilities/) and [here](http://technet.microsoft.com/en-us/security/bulletin/MS10-002)), and so the header is set to `0` to disable it. To force the header on all versions of IE, add the option:

```javascript
app.use(helmet.xssFilter({ setOnOldIE: true }));
// This has some security problems for old IE!
```

**Limitations:** This isn't anywhere near as thorough as CSP. It's only properly supported on IE9+ and Chrome; no other major browsers support it at this time. Old versions of IE support it in a buggy way, which we disable by default.

### Frame options: frameguard

**Trying to prevent:** Your page being put in a `<frame>` or `<iframe>` without your consent. This can result in [clickjacking attacks](https://en.wikipedia.org/wiki/Clickjacking), among other things.

**How to use Helmet to mitigate this:** The `X-Frame` HTTP header restricts who can put your site in a frame. It has three modes: `DENY`, `SAMEORIGIN`, and `ALLOW-FROM`. If your app does not need to be framed (and most don't) you can use the default `DENY`. If your site can be in frames from the same origin, you can set it to `SAMEORIGIN`. If you want to allow it from a specific URL, you can allow that with `ALLOW-FROM` and a URL.

Usage:

```javascript
// Only let me be framed by people of the same origin:
app.use(helmet.frameguard('sameorigin'));
app.use(helmet.frameguard());  // Same-origin by default.

// Don't allow anyone to put me in a frame.
app.use(helmet.frameguard('deny'));

// Allow from a specific host:
app.use(helmet.frameguard('allow-from', 'http://example.com'));
```

**Limitations:** This has pretty good (but not 100%) browser support: IE8+, Opera 10.50+, Safari 4+, Chrome 4.1+, and Firefox 3.6.9+. It only prevents against a certain class of attack, but does so pretty well. It also prevents your site from being framed, which you might want for legitimate reasons.

### HTTP Strict Transport Security: hsts

**Trying to prevent:** Users viewing your site on HTTP instead of HTTPS. HTTP is pretty insecure.

**How to use Helmet to mitigate this:** This middleware adds the `Strict-Transport-Security` header to the response. This tells browsers, "hey, only use HTTPS for the next period of time". ([See the spec](http://tools.ietf.org/html/draft-ietf-websec-strict-transport-sec-04) for more.)

This will set the Strict Transport Security header, telling browsers to visit by HTTPS for the next ninety days:

```javascript
var ninetyDaysInMilliseconds = 7776000000;
app.use(helmet.hsts({ maxAge: ninetyDaysInMilliseconds }));
```

You can also include subdomains. If this is set on *example.com*, supported browsers will also use HTTPS on *my-subdomain.example.com*. Here's how you do that:

```javascript
app.use(helmet.hsts({
  maxAge: 123000,
  includeSubdomains: true
}));
```

Chrome lets you submit your site for baked-into-Chrome HSTS by adding `preload` to the header. You can add that with the following code, and then submit your site to the Chrome team at [hstspreload.appspot.com](https://hstspreload.appspot.com/).

```javascript
app.use(helmet.hsts({
  maxAge: 10886400000,     // Must be at least 18 weeks to be approved by Google
  includeSubdomains: true, // Must be enabled to be approved by Google
  preload: true
}));
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
}));
```

Note that the max age is in milliseconds, even though the spec uses seconds. This will round to the nearest full second.

**Limitations:** This only works if your site actually has HTTPS. It won't tell users on HTTP to *switch* to HTTPS, it will just tell HTTPS users to stick around. You can enforce this with the [express-enforces-ssl](https://github.com/aredo/express-enforces-ssl) module. It's [somewhat well-supported by browsers](http://caniuse.com/#feat=stricttransportsecurity).

### Hide X-Powered-By: hidePoweredBy

**Trying to prevent:** Hackers can exploit known vulnerabilities in Express/Node if they see that your site is powered by Express (or whichever framework you use). `X-Powered-By: Express` is sent in every HTTP request coming from Express, by default.

**How to use Helmet to mitigate this:** The `hidePoweredBy` middleware will remove the `X-Powered-By` header if it is set (which it will be by default in Express).

```javascript
app.use(helmet.hidePoweredBy());
```

You can also explicitly set the header to something else, if you want. This could throw people off:

```javascript
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
```

Note: if you're using Express, you can skip Helmet's middleware if you want:

```javascript
app.disable('x-powered-by');
```

**Limitations:** There might be other telltale signs that your site is Express-based (a blog post about your tech stack, for example). This might prevent hackers from easily exploiting known vulnerabilities in your stack, but that's all it does.

### IE, restrict untrusted HTML: ieNoOpen

**Trying to prevent:** Some web applications will serve untrusted HTML for download. By default, some versions of IE will allow you to open those HTML files *in the context of your site*, which means that an untrusted HTML page could start doing bad things in the context of your pages. For more, see [this MSDN blog post](http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-v-comprehensive-protection.aspx).

**How to use Helmet to mitigate this:** Set the `X-Download-Options` header to `noopen` to prevent IE users from executing downloads in your site's context.

```javascript
app.use(helmet.ieNoOpen());
```

**Limitations:** This is pretty obscure, fixing a small bug on IE only. No real drawbacks other than performance/bandwidth of setting the headers, though.

### Don't infer the MIME type: noSniff

**Trying to prevent:** Some browsers will try to "sniff" mimetypes. For example, if my server serves *file.txt* with a *text/plain* content-type, some browsers can still run that file with `<script src="file.txt"></script>`. Many browsers will allow *file.js* to be run even if the content-type isn't for JavaScript. There are [some other vulnerabilities](http://miki.it/blog/2014/7/8/abusing-jsonp-with-rosetta-flash/), too.

**How to use Helmet to mitigate this:** Use Helmet's `noSniff` middleware to keep Chrome, Opera, and IE from doing this sniffing ([and Firefox soon](https://bugzilla.mozilla.org/show_bug.cgi?id=471020)). The following example sets the `X-Content-Type-Options` header to its only option, `nosniff`:

```javascript
app.use(helmet.noSniff());
```

[MSDN has a good description](http://msdn.microsoft.com/en-us/library/gg622941%28v=vs.85%29.aspx) of how browsers behave when this header is sent.

**Limitations:** This only prevents against a certain kind of attack.

### Turn off caching: noCache

**Trying to prevent:** Users caching your old, buggy resources. It's possible that you've got bugs in an old HTML or JavaScript file, and with a cache, some users will be stuck with those old versions.

**How to use Helmet to mitigate this:** Use Helmet to disable this kind of caching. This sets a number of HTTP headers that stop caching.

```javascript
app.use(helmet.noCache());
```

This will set `Cache-Control` and `Pragma` headers to stop caching. It will also set an `Expires` header of 0, effectively saying "this has already expired."

If you want to crush the `ETag` header as well, you can:

```javascript
app.use(helmet.noCache({ noEtag: true }));
```

**Limitations:** Caching has some real benefits, and you lose them here (which is why it's disabled in the default configuration). Browsers won't cache resources with this enabled, although some performance is retained if you keep ETag support. It's also possible that you'll introduce *new* bugs and you'll wish people had old resources cached, but that's less likely.

### Public Key Pinning: HPKP

**Trying to prevent:** HTTPS certificates can be forged, allowing man-in-the middle attacks. [HTTP Public Key Pinning](https://developer.mozilla.org/en-US/docs/Web/Security/Public_Key_Pinning) aims to help that.

**How to use Helmet to mitigate this:** Pass the "Public-Key-Pins" header to better assert your SSL certificates. [See the spec](https://tools.ietf.org/html/draft-ietf-websec-key-pinning-21) for more.

```javascript
var ninetyDaysInMilliseconds = 7776000000;
app.use(helmet.publicKeyPins({
  maxAge: ninetyDaysInMilliseconds,
  sha256s: ['AbCdEf123=', 'ZyXwVu456='],
  includeSubdomains: true,         // optional
  reportUri: 'http://example.com'  // optional
}));
```

**Limitations:** Don't let these get out of sync with your certs!

Other recommended modules
-------------------------

Helmet only deals with HTTP headers, but there are a number of other helpful security modules for Express. We haven't heavily audited these—that's what the [Node Security Project](https://nodesecurity.io/) is for—but take a look at some of these modules!

* [express-enforces-ssl](https://github.com/aredo/express-enforces-ssl)
* [express-content-length-validator](https://github.com/ericmdantas/express-content-length-validator)
* [hpp](https://www.npmjs.com/package/hpp)
* [cors](https://www.npmjs.org/package/cors)
