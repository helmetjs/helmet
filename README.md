Helmet
======

[![Dependency Status](https://david-dm.org/evilpacket/helmet.png)](https://david-dm.org/evilpacket/helmet)

Helmet is a series of middlewares for Express/Connect apps that implement various security headers to make your app more secure.

Included middleware
-------------------

- `csp` (Content Security Policy)
- `hsts` (HTTP Strict Transport Security)
- `xframe` (X-Frame-Options)
- `iexss` (X-XSS-Protection for IE8+)
- `ienoopen` (X-Download-Options for IE8+)
- `contentTypeOptions` (X-Content-Type-Options)
- `cacheControl` (Cache-Control)
- `hidePoweredBy` (remove X-Powered-By)

Installation
------------

    npm install helmet

Basic usage
-----------

```javascript
var helmet = require('helmet');
```

To use a particular middleware application-wide, just `use` it:

```javascript
var app = express(); // or connect

app.use(helmet.csp());
app.use(helmet.xframe('deny'));
app.use(helmet.contentTypeOptions());
```

*If you're using Express 3, make sure these middlewares are listed before `app.router`*.

If you just want to use the default-level policies, all you need to do is:

```javascript
helmet.defaults(app);
```

Don't want all the defaults?

```javascript
helmet.defaults(app, { xframe: false });
app.use(helmet.xframe('sameorigin'));
```

## Content Security Policy
The [Content Security Policy (W3C Draft)](https://dvcs.w3.org/hg/content-security-policy/raw-file/tip/csp-specification.dev.html#content-security-policy-header-field) is pretty much required reading if you want to do anything with CSP.

### Browser Support
Currently there is CSP support in Firefox and experimental support in Chrome. Both `X-Content-Security-Policy` and `X-WebKit-CSP`
headers are set by Helmet.


There are two different ways to build CSP policies with Helmet.

### Using policy()

`policy()` eats a JSON blob (including the output of its own `toJSON()` function) to create a policy. By default
helmet has a defaultPolicy that looks like;

```
Content-Security-Policy: default-src 'self'
```

To override this and create a new policy you could do something like

```javascript
policy = {
  defaultPolicy: {
    'default-src': ["'self'"],
    'img-src': ['static.andyet.net','*.cdn.example.com'],
  }
}

helmet.csp.policy(policy);
```

### Using add()

The same thing could be accomplished using `add()` since the defaultPolicy default-src is already 'self':

```javascript
helmet.csp.add('img-src', ['static.andyet.net', '*.cdn.example.com']);
```

### Reporting Violations

CSP can report violations back to a specified URL. You can either set the report-uri using `policy()` or `add()` or use the `reportTo()` helper function.

```javascript
helmet.csp.reportTo('http://example.com/csp');
```

## HTTP Strict Transport Security
[draft-ietf-websec-strict-transport-sec-04](http://tools.ietf.org/html/draft-ietf-websec-strict-transport-sec-04)

This middleware adds the `Strict-Transport-Security` header to the response.

### Basic Usage

To use the default header of `Strict-Transport-Security: maxAge=15768000`:

```javascript
helmet.hsts();
```

To adjust other values for `maxAge` and to include subdomains:

```javascript
helmet.hsts(1234567, true);  // hsts(maxAge, includeSubdomains)
```


## X-FRAME-OPTIONS

xFrame is a lot more straight forward than CSP. It has three modes. `DENY`, `SAMEORIGIN`, `ALLOW-FROM`. If your app does not need to be framed (and most don't) you can use the default `DENY`.

### Browser Support
  - IE8+
  - Opera 10.50+
  - Safari 4+
  - Chrome 4.1.249.1042+
  - Firefox 3.6.9 (or earlier with NoScript)

Here is an example for both `SAMEORIGIN` and `ALLOW-FROM`:

```javascript
helmet.xframe('sameorigin');
```

```javascript
helmet.xframe('allow-from', 'http://example.com');
```

## X-XSS-PROTECTION

The following example sets the `X-XSS-PROTECTION: 1; mode=block` header:

```javascript
helmet.iexss();
```

## X-Download-Options

Sets the `X-Download-Options` header to `noopen` to prevent IE users from executing downloads in your site's context. For more, see [this MSDN blog post](http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-v-comprehensive-protection.aspx).

```javascript
app.use(helmet.ienoopen())
```

## X-Content-Type-Options

The following example sets the `X-Content-Type-Options` header to its only and default option, `nosniff`:

```javascript
helmet.contentTypeOptions();
```

## Cache-Control

The following example sets the `Cache-Control` header to `no-store, no-cache`. This is not configurable at this time.

```javascript
helmet.cacheControl();
```

## Hide X-Powered-By

This middleware will remove the `X-Powered-By` header if it is set.

```javascript
helmet.hidePoweredBy()
```

Note: if you're using Express, you can skip Helmet's middleware if you want:

```javascript
app.disable('x-powered-by')
```

## To Be Implemented

  - Warn when self, unsafe-inline or unsafe-eval are not single quoted
  - Warn when unsafe-inline or unsafe-eval are used
  - Caching of generated CSP headers
  - Device to capture and parse reported CSP violations

[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/aaabccb3974032554c072dce9a0c46c9 "githalytics.com")](http://githalytics.com/evilpacket/helmet)
