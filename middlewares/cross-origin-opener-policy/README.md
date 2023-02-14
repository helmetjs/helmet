# Cross-Origin-Opener-Policy middleware

This middleware sets the `Cross-Origin-Opener-Policy` header. It is used to control whether a document is allowed to use features that require a same-origin opener. This is a security feature that prevents cross-origin information leaks. Read more about it [here](https://web.dev/coop-coep/).

Usage:

```javascript
const crossOriginOpenerPolicy = require("cross-origin-opener-policy");

// Sets "Cross-Origin-Opener-Policy: same-origin" (default)
app.use(crossOriginOpenerPolicy());

// Sets "Cross-Origin-Opener-Policy: unsafe-none" (same as not setting it)
app.use(crossOriginOpenerPolicy({ policy: "unsafe-none" }));

// Sets "Cross-Origin-Opener-Policy: same-origin-allow-popups"
app.use(crossOriginOpenerPolicy({ policy: "same-origin-allow-popups" }));
```
