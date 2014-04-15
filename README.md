Helmet
======

[![Dependency Status](https://david-dm.org/evilpacket/helmet.png)](https://david-dm.org/evilpacket/helmet)

Helmet is a series of middlewares for Express/Connect apps that implement various security headers to make your app more secure. *It's not a silver bullet*, but it can help!

Helmet includes the following middlewares:

- `csp` (Content Security Policy)
- `hsts` (HTTP Strict Transport Security)
- `xframe` (X-Frame-Options)
- `iexss` (X-XSS-Protection for IE8+)
- `ienoopen` (X-Download-Options for IE8+)
- `contentTypeOptions` (X-Content-Type-Options)
- `cacheControl` (Cache-Control)
- `crossdomain` (crossdomain.xml)
- `hidePoweredBy` (remove X-Powered-By)

Installation
------------

    npm install helmet

Basic usage
-----------


To use a particular middleware application-wide, just `use` it:

```javascript
var helmet = require('helmet')
var app = express() // or connect

app.use(helmet.csp())
app.use(helmet.xframe('deny'))
app.use(helmet.contentTypeOptions())
```

*If you're using Express 3, make sure these middlewares are listed before `app.router`.*

If you just want to use the default-level policies, all you need to do is:

```javascript
app.use(helmet.defaults())
```

Don't want all the defaults?

```javascript
helmet.defaults(app, { xframe: false })
app.use(helmet.xframe('sameorigin'))
```

Content Security Policy
------------------------

Setting an appropriate Content Security Policy can protect your users against a variety of attacks (perhaps the largest of which is XSS). To learn more about CSP, check out the [HTML5 Rocks guide](http://www.html5rocks.com/en/tutorials/security/content-security-policy/).

Usage:

```javascript
app.use(helmet.csp({
  'default-src': ["'self'", 'default.com'],
  'script-src': ['scripts.com'],
  'style-src': ['style.com'],
  'img-src': ['img.com'],
  'connect-src': ['connect.com'],
  'font-src': ['font.com'],
  'object-src': ['object.com'],
  'media-src': ['media.com'],
  'frame-src': ['frame.com'],
  'sandbox': ['allow-forms', 'allow-scripts'],
  'report-uri': ['/report-violation'],
  reportOnly: false, // set to true if you only want to report errors
  setAllHeaders: false, // set to true if you want to set all headers
  safari5: false // set to true if you want to force buggy CSP in Safari 5
})
```

There are a lot of inconsistencies in how browsers implement CSP. Helmet sniffs the user-agent of the browser and sets the appropriate header and value for that browser. If no user-agent is found, it will set _all_ the headers with the 1.0 spec.

HTTP Strict Transport Security
-------------------------------

This middleware adds the `Strict-Transport-Security` header to the response. [See the spec.](http://tools.ietf.org/html/draft-ietf-websec-strict-transport-sec-04)

To use the default header of `Strict-Transport-Security: maxAge=15768000` (about 6 months):

```javascript
app.use(helmet.hsts())
```

To adjust other values for `maxAge` and to include subdomains:

```javascript
app.use(helmet.hsts(1234567, true))
```

Note that the max age is in _seconds_, not milliseconds (as is typical in JavaScript).

X-Frame-Options
---------------

X-Frame specifies whether your app can be put in a frame or iframe. It has three modes: `DENY`, `SAMEORIGIN`, and `ALLOW-FROM`. If your app does not need to be framed (and most don't) you can use the default `DENY`.

Usage:

```javascript
// These are equivalent:
app.use(helmet.xframe())
app.use(helmet.xframe('deny'))

// Only let me be framed by people of the same origin:
app.use(helmet.xframe('sameorigin'))

// Allow from a specific host:
app.use(helmet.xframe('allow-from', 'http://example.com'))
```

### Browser Support

- IE8+
- Opera 10.50+
- Safari 4+
- Chrome 4.1.249.1042+
- Firefox 3.6.9 (or earlier with NoScript)

X-XSS-Protection
-----------------

The X-XSS-Protection header is a basic protection against XSS.

Usage:

```javascript
app.use(helmet.iexss())
```

This sets the `X-XSS-Protection` header. On modern browsers, it will set the value to `1; mode=block`. On old versions of Internet Explorer, this creates a vulnerability (see [here](http://hackademix.net/2009/11/21/ies-xss-filter-creates-xss-vulnerabilities/) and [here](http://technet.microsoft.com/en-us/security/bulletin/MS10-002)), and so the header is set to `0`. To force the header on all versions of IE, add the option:

```javascript
app.use(helmet.iexss({ setOnOldIE: true }))
```

## X-Download-Options

Sets the `X-Download-Options` header to `noopen` to prevent IE users from executing downloads in your site's context. For more, see [this MSDN blog post](http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-v-comprehensive-protection.aspx).

```javascript
app.use(helmet.ienoopen())
```

X-Content-Type-Options
----------------------

The following example sets the `X-Content-Type-Options` header to its only and default option, `nosniff`:

```javascript
app.use(helmet.contentTypeOptions())
```

Cache-Control
-------------

The following example sets the `Cache-Control` header to `no-store, no-cache`. This is not configurable at this time.

```javascript
app.use(helmet.cacheControl())
```

Crossdomain.xml
---------------

The following example sets the most restrictive [crossdomain.xml](http://www.adobe.com/devnet/articles/crossdomain_policy_file_spec.html):

```javascript
app.use(helmet.crossdomain())
```

Hide X-Powered-By
-----------------

This middleware will remove the `X-Powered-By` header if it is set.

```javascript
app.use(helmet.hidePoweredBy())
```

Note: if you're using Express, you can skip Helmet's middleware if you want:

```javascript
app.disable('x-powered-by')
```
