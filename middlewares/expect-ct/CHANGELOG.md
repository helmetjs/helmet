# Changelog

## 1.0.0 - 2020-08-02

### Changed

- If `maxAge` is `undefined`, it will be set to `0`
- If `maxAge` is not an integer, it will be rounded down

### Removed

- Dropped support for old Node versions. Node 10+ is now required

## 0.3.0 - 2019-09-01

### Changed

- Dropped support for Node <8
- You must now pass a positive integer for `maxAge` (instead of any positive number)
- You cannot pass `undefined` for `maxAge` (though you can still omit the property)

## 0.2.0 - 2019-05-04

### Added

- TypeScript type definitions. See [helmetjs/helmet#188](https://github.com/helmetjs/helmet/issues/188)
- Additional package metadata (bugs, homepage, etc)

### Changed

- Updated documentation

Changes in versions 0.1.1 and below can be found in [Helmet's changelog](https://github.com/helmetjs/helmet/blob/master/CHANGELOG.md).
