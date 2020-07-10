# Changelog

## 3.0.0 - Unreleased

### Added

- TypeScript type definitions. See [#25](https://github.com/helmetjs/hsts/pull/25)

### Removed

- Dropped support for `includeSubdomains` with a lowercase D. See [#231](https://github.com/helmetjs/helmet/issues/231)
- Dropped support for `setIf`. [Read this if you need help.](https://github.com/helmetjs/helmet/wiki/Conditionally-using-middleware). See [#232](https://github.com/helmetjs/helmet/issues/232)
- Dropped support for old Node versions. Node 10+ is now required

## 2.2.0 - 2019-03-10

### Added

- Created a changelog

### Changed

- Mark the module as Node 4+ in the `engines` field of `package.json`
- Add a `homepage` in `package.json`
- Add an email to `package.json`'s `bugs` field
- Updated documentation
- Updated Adam Baldwin's contact info. See [helmetjs/helmet#189](https://github.com/helmetjs/helmet/issues/189)

### Deprecated

- The `setIf` option has been deprecated and will be removed in `hsts@3`. Refer to the documentation to see how to do without it. See [#22](https://github.com/helmetjs/hsts/issues/22) for more
- The `includeSubdomains` option (with a lowercase `d`) has been deprecated and will be removed in `hsts@3`. Use the uppercase-D `includeSubDomains` option instead. See [#21](https://github.com/helmetjs/hsts/issues/21) for more

Changes in versions 2.1.0 and below can be found in [Helmet's changelog](https://github.com/helmetjs/helmet/blob/master/CHANGELOG.md).
