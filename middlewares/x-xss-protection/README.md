# X-XSS-Protection middleware

The `X-XSS-Protection` HTTP header aimed to offer a basic protection against cross-site scripting (XSS) attacks. _However, you probably should disable it_, which is what this middleware does.

Many browsers have chosen to remove it because of the unintended security issues it creates. Generally, you should protect against XSS with sanitization and a Content Security Policy. For more, read [this GitHub issue](https://github.com/helmetjs/helmet/issues/230).

This middleware sets the `X-XSS-Protection` header to `0`. For example:

```javascript
const xXssProtection = require("x-xss-protection");

// Set "X-XSS-Protection: 0"
app.use(xXssProtection());
```

If you truly need the legacy behavior, you can write your own simple middleware and avoid installing this module. For example:

```javascript
// NOTE: This is probably insecure!
app.use((req, res, next) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
```
