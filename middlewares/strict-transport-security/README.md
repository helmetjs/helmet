# HTTP Strict Transport Security middleware

This middleware adds the `Strict-Transport-Security` header to the response. This tells browsers, "hey, only use HTTPS for the next period of time". ([See the spec](https://tools.ietf.org/html/rfc6797) for more.) Note that the header won't tell users on HTTP to _switch_ to HTTPS, it will just tell HTTPS users to stick around. You can enforce HTTPS with the [express-enforces-ssl](https://github.com/aredo/express-enforces-ssl) module.

This will set the Strict Transport Security header, telling browsers to visit by HTTPS for the next 180 days:

```javascript
const strictTransportSecurity = require("hsts");

// Sets "Strict-Transport-Security: max-age=15552000; includeSubDomains"
app.use(
  strictTransportSecurity({
    maxAge: 15552000, // 180 days in seconds
  })
);
```

Note that the max age must be in seconds.

The `includeSubDomains` directive is present by default. If this header is set on _example.com_, supported browsers will also use HTTPS on _my-subdomain.example.com_. You can disable this:

```javascript
app.use(
  strictTransportSecurity({
    maxAge: 15552000,
    includeSubDomains: false,
  })
);
```

Some browsers let you submit your site's HSTS to be baked into the browser. You can add `preload` to the header with the following code. You can check your eligibility and submit your site at [hstspreload.org](https://hstspreload.org/).

```javascript
app.use(
  strictTransportSecurity({
    maxAge: 31536000, // Must be at least 1 year to be approved
    includeSubDomains: true, // Must be enabled to be approved
    preload: true,
  })
);
```

[The header is ignored in insecure HTTP](https://tools.ietf.org/html/rfc6797#section-8.1), so it's safe to set in development.

This header is [somewhat well-supported by browsers](https://caniuse.com/#feat=stricttransportsecurity).
