Express / Connect middleware that implement various security headers. [with sane defaults where applicable]

## Included Middleware

  - csp (Content Security Policy)
  - xframe (X-FRAME-OPTIONS)

## Basic Express Usage

```javascript
    var helmet = require('helmet');
```

To use a particular middleware application wide just add it to your app configuration.

```javascript
    app.configure(function(){
        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(helmet.csp());
        app.use(helmet.xframe());
        app.use(app.router);
    });
```

## Content Security Policy
[Content Security Policy (W3C Draft)](https://dvcs.w3.org/hg/content-security-policy/raw-file/tip/csp-specification.dev.html#content-security-policy-header-field)
<- Pretty much required reading if you want to do anything with CSP

### Browser Support
Currently there is CSP support in Firefox and experimental support in Chrome. Both X-Content-Security-Policy and X-WebKit-CSP
headers are set by helmet.


There are two different ways to build CSP policies with helmet.

### Using policy()

policy() eats a json blob (including the output of it's own toJSON() function) to create a policy. By default
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

The same thing could be accomplished using add() since the defaultPolicy default-src is already 'self'

```javascript
helmet.csp.add('img-src', ['static.andyet.net', '*.cdn.example.com']);
```

### Reporting Violations

CSP can report violations back to a specified URL. You can either set the report-uri using policy() or add() or
use the reportTo() helper function.

```javascript
helmet.csp.reportTo('http://example.com/csp');
```


## X-FRAME-OPTIONS

xFrame is a lot more straight forward than CSP. It has three modes. DENY, SAMEORIGIN, ALLOW-FROM. If your app does
not need to be framed (and most don't) you can use the default DENY.

### Browser Support
  - IE8+
  - Opera 10.50+
  - Safari 4+
  - Chrome 4.1.249.1042+
  - Firefox 3.6.9 (or earlier with NoScript)

Here is an example for both SAMEORIGIN and ALLOW-FROM

```javascript
helmet.xframe('sameorigin');
```

```javascript
helmet.xframe('allow-from', 'http://example.com');
```

## To Be Implemented

  - HTTP Strict Transport Security
  - X-XSS-Protection for IE
  - Warn when self, unsafe-inline or unsafe-eval are not single quoted
  - Warn when unsafe-inline or unsafe-eval are used
  - Caching of generated CSP headers
  - Device to capture and parse reported CSP violations

