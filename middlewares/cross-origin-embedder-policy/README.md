# Cross-Origin-Embedder-Policy middleware

This middleware sets the `Cross-Origin-Embedder-Policy header`. It is used to control whether a document is allowed to use resources that require a same-origin embedding mechanism. This is a security feature that prevents cross-origin information leaks. Read more about it [here](https://http.dev/cross-origin-embedder-policy).

Usage:

```javascript
const crossOriginEmbedderPolicy = require("cross-origin-embedder-policy");

// Sets "Cross-Origin-Embedder-Policy: require-corp" (default)
app.use(crossOriginEmbedderPolicy());

// Sets "Cross-Origin-Embedder-Policy: credentialless" (experimental policy)
app.use(crossOriginEmbedderPolicy({ policy: "credentialless" }));
```
