# Changelog

## 2.0.0 - 2020-08-02

### Changed

- XSS filtering is now disabled by default. See [#230](https://github.com/helmetjs/helmet/issues/230)

### Removed

- No longer accepts options. Read ["How to disable blocking with X–XSS–Protection"](https://github.com/helmetjs/helmet/wiki/How-to-disable-blocking-with-X%E2%80%93XSS%E2%80%93Protection) and ["How to enable the `report` directive with X–XSS–Protection"](https://github.com/helmetjs/helmet/wiki/How-to-enable-the-%60report%60-directive-with-X%E2%80%93XSS%E2%80%93Protection) if you need the legacy behavior.
- Dropped support for old Node versions. Node 10+ is now required

## 1.3.0 - 2019-09-01

### Added

- Added `mode: null` to disable `mode=block`

### Changed

- Minor performance improvements with Internet Explorer <9 detection

## 1.2.0 - 2019-06-15

### Added

- Added TypeScript type definitions. See [#8](https://github.com/helmetjs/x-xss-protection/pull/8)
- Created a changelog
- Added some additional package metadata

### Changed

- Updated documentation
- Excluded some files from npm package

Changes in versions 1.1.0 and below can be found in [Helmet's changelog](https://github.com/helmetjs/helmet/blob/master/CHANGELOG.md).
