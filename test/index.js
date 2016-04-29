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

  describe('module aliases', function () {
    it('aliases "dns-prefetch-control"', function () {
      var pkg = require('dns-prefetch-control')
      assert.equal(helmet['dns-prefetch-control'], pkg)
      assert.equal(helmet.dnsPrefetchControl, pkg)
    })

    it('aliases "dont-sniff-mimetype"', function () {
      var pkg = require('dont-sniff-mimetype')
      assert.equal(helmet['dont-sniff-mimetype'], pkg)
      assert.equal(helmet.nosniff, pkg)
      assert.equal(helmet.noSniff, pkg)
    })

    it('aliases "frameguard"', function () {
      var pkg = require('frameguard')
      assert.equal(helmet['frameguard'], pkg)
      assert.equal(helmet.frameguard, pkg)
      assert.equal(helmet.frameGuard, pkg)
      assert.equal(helmet.xframe, pkg)
      assert.equal(helmet.xFrame, pkg)
    })

    it('aliases "helmet-csp"', function () {
      var pkg = require('helmet-csp')
      assert.equal(helmet['helmet-csp'], pkg)
      assert.equal(helmet.csp, pkg)
      assert.equal(helmet.contentSecurityPolicy, pkg)
    })

    it('aliases "hide-powered-by"', function () {
      var pkg = require('hide-powered-by')
      assert.equal(helmet['hide-powered-by'], pkg)
      assert.equal(helmet.hidePoweredBy, pkg)
      assert.equal(helmet.hideXPoweredBy, pkg)
    })

    it('aliases "hpkp"', function () {
      var pkg = require('hpkp')
      assert.equal(helmet.hpkp, pkg)
      assert.equal(helmet.publicKeyPinning, pkg)
      assert.equal(helmet.publicKeyPins, pkg)
      assert.equal(helmet.hPkp, pkg)
      assert.equal(helmet.hkpk, pkg)
    })

    it('aliases "hsts"', function () {
      var pkg = require('hsts')
      assert.equal(helmet.hsts, pkg)
    })

    it('aliases "ienoopen"', function () {
      var pkg = require('ienoopen')
      assert.equal(helmet.ienoopen, pkg)
      assert.equal(helmet.ieNoOpen, pkg)
      assert.equal(helmet.IENoOpen, pkg)
    })

    it('aliases "nocache"', function () {
      var pkg = require('nocache')
      assert.equal(helmet.nocache, pkg)
      assert.equal(helmet.noCache, pkg)
    })

    it('aliases "x-xss-protection"', function () {
      var pkg = require('x-xss-protection')
      assert.equal(helmet['x-xss-protection'], pkg)
      assert.equal(helmet.xssFilter, pkg)
      assert.equal(helmet.xssfilter, pkg)
      assert.equal(helmet.xXSSProtection, pkg)
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
