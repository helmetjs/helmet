# Changelog

## 3.2.0 - 2020-11-01

### Added

- Get the default directives with `contentSecurityPolicy.getDefaultDirectives()`

## 3.1.0 - 2020-08-15

### Added

- Directive values can now include functions, as they could in Helmet 3. See [#243](https://github.com/helmetjs/helmet/issues/243)

## 3.0.0 - 2020-08-02

### Added

- If no `default-src` directive is supplied, an error is thrown
- Directive lists can be any iterable, not just arrays

### Changed

- There is now a default set of directives if none are supplied
- Duplicate keys now throw an error. See [helmetjs/csp#73](https://github.com/helmetjs/csp/issues/73)
- This middleware is more lenient, allowing more directive names or values

### Removed

- Removed browser sniffing (including the `browserSniff` parameter). See [#97](https://github.com/helmetjs/csp/issues/97)
- Removed conditional support. This includes directive functions and support for a function as the `reportOnly`. [Read this if you need help.](https://github.com/helmetjs/helmet/wiki/Conditionally-using-middleware)
- Removed a lot of checks—you should be checking your CSP with a different tool
- Removed support for legacy headers (and therefore the `setAllHeaders` parameter). [Read this if you need help.](https://github.com/helmetjs/helmet/wiki/Setting-legacy-Content-Security-Policy-headers-in-Helmet-4)
- Dropped support for old Node versions. Node 10+ is now required
- Removed the `loose` option
- Removed support for functions as directive values. You must supply an iterable of strings
- Removed the `disableAndroid` option

## 2.9.5 - 2020-02-22

### Changed

- Updated `bowser` subdependency from 2.7.0 to 2.9.0

### Fixed

- Fixed an issue some people were having when importing the `bowser` subdependency. See [#96](https://github.com/helmetjs/csp/issues/96) and [#101](https://github.com/helmetjs/csp/pull/101)
- Fixed a link in the readme. See [#100](https://github.com/helmetjs/csp/pull/100)

## 2.9.4 - 2019-10-21

### Changed

- Updated `bowser` subdependency from 2.6.1 to 2.7.0. See [#94](https://github.com/helmetjs/csp/pull/94)

## 2.9.3 - 2019-09-30

### Fixed

- Published a missing TypeScript type definition file. See [#90](https://github.com/helmetjs/csp/issues/90)

## 2.9.2 - 2019-09-20

### Fixed

- Fixed a bug where a request from Firefox 4 could delete `default-src` from future responses
- Fixed tablet PC detection by updating `bowser` subdependency to latest version

## 2.9.1 - 2019-09-04

### Changed

- Updated `bowser` subdependency from 2.5.3 to 2.5.4. See [#88](https://github.com/helmetjs/csp/pull/88)

### Fixed

- The "security" keyword was declared twice in package metadata. See [#87](https://github.com/helmetjs/csp/pull/87)

## 2.9.0 - 2019-08-28

### Added

- Added TypeScript type definitions. See [#86](https://github.com/helmetjs/csp/pull/86)

### Fixed

- Switched from `platform` to `bowser` to quiet a security vulnerability warning. See [#80](https://github.com/helmetjs/csp/issues/80)

## 2.8.0 - 2019-07-24

### Added

- Added a new `sandbox` directive, `allow-downloads-without-user-activation` (see [#85](https://github.com/helmetjs/csp/pull/85))
- Created a changelog
- Added some package metadata

### Changed

- Updated documentation to use ES2015
- Updated documentation to remove dependency on UUID package
- Updated `content-security-policy-builder` to 2.1.0
- Excluded some files from the npm package

Changes in versions 2.7.1 and below can be found in [Helmet's changelog](https://github.com/helmetjs/helmet/blob/master/CHANGELOG.md).
