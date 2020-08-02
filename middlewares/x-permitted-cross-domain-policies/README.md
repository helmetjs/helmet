# X-Permitted-Cross-Domain-Policies middleware

The `X-Permitted-Cross-Domain-Policies` header tells some web clients (like Adobe Flash or Adobe Acrobat) your domain's policy for loading cross-domain content. See the description on [OWASP](https://owasp.org/www-project-secure-headers/) for more.

Usage:

```javascript
const crossdomain = require("helmet-crossdomain");

// Sets X-Permitted-Cross-Domain-Policies: none
app.use(crossdomain());

// You can use any of the following values:
app.use(crossdomain({ permittedPolicies: "none" }));
app.use(crossdomain({ permittedPolicies: "master-only" }));
app.use(crossdomain({ permittedPolicies: "by-content-type" }));
app.use(crossdomain({ permittedPolicies: "all" }));
```

The `by-ftp-type` is not currently supported. Please open an issue or pull request if you desire this feature!

If you don't expect Adobe products to load data from your site, you get a minor security benefit by adding this header.
