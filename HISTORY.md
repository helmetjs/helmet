0.5.4 / 2014-12-21
==================

- update: `nocache` should force revalidation

0.5.3 / 2014-12-08
==================

- update: Platform version in CSP and X-XSS-Protection

- fix: bad wording in frameguard docs

0.5.2 / 2014-11-16
==================

- update: Connect version
- update: Sinon version

- fix: minor `csp` bugfixes

0.5.1 / 2014-11-09
==================

- new: Travis CI for everyone

- update: URLs in `package.json` for new URL

- fix: CSP would set all headers forever after receiving an unknown user agent

0.5.0 / 2014-10-28
==================

- new: most middlewares have some aliases now

- update: `xframe` now called `frameguard` (though `xframe` still works)
- update: `frameguard` chooses sameorigin by default
- update: `frameguard` understands "SAME-ORIGIN" in addition to "SAMEORIGIN"
- update: `nocache` removed from default middleware stack
- update: middleware split out into their own modules
- update: documentation
- update: supported Node version to at least 0.10.0
- update: Connect version

- fix: readme link was broken

- remove: deprecation warnings

0.4.2 / 2014-10-16
==================

- new: support preload in HSTS header

0.4.1 / 2014-08-24
==================

- update: use [helmet-crossdomain](https://github.com/helmetjs/crossdomain) to test the waters
- update: 2 spaces instead of 4 throughout the code

0.4.0 / 2014-07-17
==================

- new: nocache now sets the Expires and Pragma headers
- new: nocache now allows you to crush ETags

- update: improve the docs for nosniff
- update: revert HSTS behavior of requiring a specified max-age

- fix: allow HSTS to have a max-age of 0

0.3.2 / 2014-06-30
==================

- new: all middleware functions are named
- new: throw error with non-positive HSTS max-age

- update: add semicolons in README
- update: make some Errors more specific

- fix: `helmet()` was having issues
- fix: syntax errors in README

- remove: all comment headers; refer to the readme

0.3.1
=====

This file was started after the release of 0.3.1.
