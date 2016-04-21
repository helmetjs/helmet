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

  it('chains all default middleware with empty options', function () {
    moduleNames.forEach(function (moduleName) {
      sinon.spy(helmet, moduleName)
    })
    helmet({})
    moduleNames.forEach(function (moduleName) {
      var pkg = helmet[moduleName]
      var isDefault = config.defaultMiddleware.indexOf(moduleName) !== -1
      if (isDefault) {
        assert(pkg.calledOnce, moduleName + ' is default but is not called')
      } else {
        assert(!pkg.called, moduleName + ' is called but is not default')
      }
      pkg.restore()
    })
  })

  it('chains nothing when disabling all default middleware', function () {
    var options = {}
    moduleNames.forEach(function (moduleName) {
      sinon.spy(helmet, moduleName)
    })
    config.defaultMiddleware.forEach(function (moduleName) {
      options[moduleName] = false
    })
    helmet(options)
    moduleNames.forEach(function (moduleName) {
      var pkg = helmet[moduleName]
      assert(!pkg.called, moduleName + ' should not be called')
      pkg.restore()
    })
  })

  it('chains all when enabling all middleware', function () {
    var options = {}
    moduleNames.forEach(function (moduleName) {
      sinon.spy(helmet, moduleName)
      options[moduleName] = true
      if (moduleName === 'hpkp') {
        // hpkp has two required options, providing fake ones
        options[moduleName] = {
          maxAge: 90 * 24 * 3600 * 1000, // ninetyDaysInMilliseconds
          sha256s: ['AbCdEf123=', 'ZyXwVu456=']
        }
      }
    })
    helmet(options)
    moduleNames.forEach(function (moduleName) {
      var pkg = helmet[moduleName]
      assert(pkg.called, moduleName + ' should be called')
      pkg.restore()
    })
  })

  it('apply correct options', function () {
    var options = {}
    var xssOptions = { setOnOldIe: true }

    var moduleName = 'x-xss-protection'
    sinon.spy(helmet, moduleName)
    options[moduleName] = xssOptions

    helmet(options)

    var pkg = helmet[moduleName]
    assert(pkg.calledWith(xssOptions), moduleName + ' not called with correct options')
    pkg.restore()
  })
})
