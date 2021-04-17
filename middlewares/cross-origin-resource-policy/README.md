# Cross-Origin-Resource-Policy middleware

This middleware sets the `Cross-Origin-Resource-Policy` header. Read about it [in the spec](https://fetch.spec.whatwg.org/#cross-origin-resource-policy-header).

Usage:

```javascript
const crossOriginResourcePolicy = require("cross-origin-resource-policy");

// Sets "Cross-Origin-Resource-Policy: same-origin"
app.use(crossOriginResourcePolicy({ policy: "same-origin" }));

// Sets "Cross-Origin-Resource-Policy: same-site"
app.use(crossOriginResourcePolicy({ policy: "same-site" }));
```
