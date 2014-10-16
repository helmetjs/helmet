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
