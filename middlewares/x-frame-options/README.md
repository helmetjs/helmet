# X-Frame-Options middleware

The `X-Frame-Options` HTTP header restricts who can put your site in a frame which can help mitigate things like [clickjacking attacks](https://en.wikipedia.org/wiki/Clickjacking). It has three modes: `DENY`, `SAMEORIGIN`, and `ALLOW-FROM`, defaulting to `SAMEORIGIN`. If your app does not need to be framed (and most don't) you can use `DENY`. If your site can be in frames from the same origin, you can set it to `SAMEORIGIN`. If you want to allow it from a specific URL, you can allow that with `ALLOW-FROM` and a URL (but this has poor browser support).

Usage:

```javascript
const frameguard = require("frameguard");

// Don't allow me to be in ANY frames:
app.use(frameguard({ action: "deny" }));

// Only let me be framed by people of the same origin:
app.use(frameguard({ action: "sameorigin" }));
app.use(frameguard()); // defaults to sameorigin

// Allow from a specific host (warning: poor browser support):
app.use(
  frameguard({
    action: "allow-from",
    domain: "https://example.com",
  })
);
```

This has pretty good (but not 100%) browser support: IE8+, Opera 10.50+, Safari 4+, Chrome 4.1+, and Firefox 3.6.9+.

The `ALLOW-FROM` header option is [not supported in Chrome, Firefox, Safari], and others(https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options#Browser_compatibility). Those browsers will ignore the entire header, [and the frame _will_ be displayed](https://www.owasp.org/index.php/Clickjacking_Defense_Cheat_Sheet#Limitations_2), so you probably want to avoid using that option.
