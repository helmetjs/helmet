# Referrer-Policy middleware

The [Referer HTTP header](https://en.wikipedia.org/wiki/HTTP_referer) is typically set by web browsers to tell the server where it's coming from. For example, if you click a link on _example.com/index.html_ that takes you to _wikipedia.org_, Wikipedia's servers will see `Referer: example.com`. This can have privacy implications—websites can see where you are coming from. The new [`Referrer-Policy` HTTP header](https://www.w3.org/TR/referrer-policy/#referrer-policy-header) lets authors control how browsers set the Referer header.

[Read the spec](https://www.w3.org/TR/referrer-policy/#referrer-policies) to see the options you can provide.

Usage:

```javascript
const referrerPolicy = require("referrer-policy");

app.use(referrerPolicy({ policy: "same-origin" }));
// Referrer-Policy: same-origin

app.use(referrerPolicy({ policy: "unsafe-url" }));
// Referrer-Policy: unsafe-url

app.use(
  referrerPolicy({
    policy: ["no-referrer", "unsafe-url"],
  })
);
// Referrer-Policy: no-referrer,unsafe-url

app.use(referrerPolicy());
// Referrer-Policy: no-referrer
```
