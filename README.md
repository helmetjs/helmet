
Express / Connect middleware that implement various security headers.

## Middleware

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



## To Be Implemented

  - HTTP Strict Transport Security
  - X-XSS-Protection for IE
  - Warn when self, unsafe-inline or unsafe-eval are not single quoted
  - Warn when unsafe-inline or unsafe-eval are used
  - Caching of generated CSP headers

