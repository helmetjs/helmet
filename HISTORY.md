unreleased
==========

- new: add "Handling CSP violations" to `csp` readme
- new: add license to `package.json`

- update: `hpkp` had a link to the wrong place in its readme

0.9.0 / 2015-04-24
==================

- update: `nocache` adds `private` to its `Cache-Control` directive
- update: `package.json` description

0.8.0 / 2015-04-21
==================

- update: deprecate `crossdomain` middleware
- update: remove hefty Lodash dependency from HSTS and CSP
- update: update string detection module in Frameguard
- update: change readme slightly to better reflect project's focus

- remove: `crossdomain` is no longer a default middleware

0.7.1 / 2015-03-23
==================

- update: all outdated dependencies (insofar as possible)
- update: HSTS now uses Lodash like all the rest of the libraries

0.7.0 / 2015-03-05
==================

- new: `hpkp` middleware

- update: Travis CI should test 0.10 and 0.12
- update: minor code cleanup

0.6.2 / 2015-03-01
==================

- update: improve `xssFilter` performance
- update: Lodash versions

0.6.1 / 2015-02-13
==================

- new: "Other recommended modules" in README

- update: Lodash version

- fix: `frameguard` middleware exported a function called `xframe`

0.6.0 / 2015-01-21
==================

- new: you can disable `csp` for Android

- fix: `csp` on Chrome Mobile on Android and iOS

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
