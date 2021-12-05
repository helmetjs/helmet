# Helmet maintainer readme

These are notes for any maintainers of Helmet...which is currently just [Evan Hahn](https://evanhahn.com/). These notes may be of interest to future maintainers, contributors, or people making forks.

## Releasing Helmet

tl;dr:

- `npm publish` builds and releases the `helmet` package
- `npm run build-middleware-package -- $MIDDLEWARE_NAME` builds `$MIDDLEWARE_NAME` and puts it in a temporary directory to be published

Helmet releases have the following goals:

- Users should be able to import the package with CommonJS. The following code snippet should work as expected:

  ```js
  const helmet = require("helmet");
  app.use(helmet());
  app.use(helmet.ieNoOpen());
  ```

- Users should be able to import the package with ECMAScript modules. The default export should be a function, and the rest of the functions should be available too. The following snippets should work as expected:

  ```js
  import helmet from "helmet";
  app.use(helmet());
  ```

  ```js
  import { ieNoOpen } from "helmet";
  app.use(ieNoOpen());
  ```

- TypeScript users should be able to import Helmet and various exported types.

  ```ts
  import helmet, { HelmetOptions, ContentSecurityPolicyOptions } from "helmet";
  ```

- Some middlewares have their own npm packages, such as `helmet-csp` or `frameguard`.

- `helmet` should have no production dependencies, including middleware packages, to simplify installation.

To that end, there are special scripts for building `helmet` and for building middleware packages.
