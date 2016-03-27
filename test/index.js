var helmet = require('..')
var config = require('../config')

var assert = require('assert')
var sinon = require('sinon')

describe('helmet', function () {
  beforeEach(function () {
    this.sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    this.sandbox.restore()
  })

  it('maintains module aliases', function () {
    Object.keys(config.middlewares).forEach(function (moduleName) {
      var pkg = require(moduleName)

      config.middlewares[moduleName].forEach(function (aliasName) {
        assert.equal(helmet[aliasName], pkg)
      })
    })
  })

  it('chains all default middleware', function () {
    Object.keys(config.middlewares).forEach(function (moduleName) {
      this.sandbox.spy(helmet, moduleName)
    }.bind(this))

    helmet()

    Object.keys(config.middlewares).forEach(function (moduleName) {
      var pkg = helmet[moduleName]

      var isDefault = config.defaultMiddleware.indexOf(moduleName) !== -1
      if (isDefault) {
        assert(pkg.calledOnce, moduleName + ' is default but is not called')
      } else {
        assert(!pkg.called, moduleName + ' is called but is not default')
      }
    })
  })
})
