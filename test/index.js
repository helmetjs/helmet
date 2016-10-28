var helmet = require('..')

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
      assert.equal(helmet.dnsPrefetchControl, pkg)
    })

    it('aliases "dont-sniff-mimetype"', function () {
      var pkg = require('dont-sniff-mimetype')
      assert.equal(helmet.noSniff, pkg)
    })

    it('aliases "frameguard"', function () {
      var pkg = require('frameguard')
      assert.equal(helmet.frameguard, pkg)
    })

    it('aliases "helmet-csp"', function () {
      var pkg = require('helmet-csp')
      assert.equal(helmet.contentSecurityPolicy, pkg)
    })

    it('aliases "hide-powered-by"', function () {
      var pkg = require('hide-powered-by')
      assert.equal(helmet.hidePoweredBy, pkg)
    })

    it('aliases "hpkp"', function () {
      var pkg = require('hpkp')
      assert.equal(helmet.hpkp, pkg)
    })

    it('aliases "hsts"', function () {
      var pkg = require('hsts')
      assert.equal(helmet.hsts, pkg)
    })

    it('aliases "ienoopen"', function () {
      var pkg = require('ienoopen')
      assert.equal(helmet.ieNoOpen, pkg)
    })

    it('aliases "nocache"', function () {
      var pkg = require('nocache')
      assert.equal(helmet.noCache, pkg)
    })

    it('aliases "referrer-policy"', function () {
      var pkg = require('referrer-policy')
      assert.equal(helmet.referrerPolicy, pkg)
    })

    it('aliases "x-xss-protection"', function () {
      var pkg = require('x-xss-protection')
      assert.equal(helmet.xssFilter, pkg)
    })
  })

  describe('helmet()', function () {
    beforeEach(function () {
      Object.keys(helmet).forEach(function (key) {
        if (typeof helmet[key] === 'function') {
          this.sandbox.spy(helmet, key)
        }
      }.bind(this))
    })

    it('chains all default middleware', function () {
      helmet()

      sinon.assert.calledOnce(helmet.dnsPrefetchControl)
      sinon.assert.calledOnce(helmet.frameguard)
      sinon.assert.calledOnce(helmet.hidePoweredBy)
      sinon.assert.calledOnce(helmet.hsts)
      sinon.assert.calledOnce(helmet.ieNoOpen)
      sinon.assert.calledOnce(helmet.noSniff)
      sinon.assert.calledOnce(helmet.xssFilter)

      sinon.assert.calledWith(helmet.dnsPrefetchControl, {})
      sinon.assert.calledWith(helmet.frameguard, {})
      sinon.assert.calledWith(helmet.hidePoweredBy, {})
      sinon.assert.calledWith(helmet.hsts, {})
      sinon.assert.calledWith(helmet.ieNoOpen, {})
      sinon.assert.calledWith(helmet.noSniff, {})
      sinon.assert.calledWith(helmet.xssFilter, {})

      sinon.assert.notCalled(helmet.contentSecurityPolicy)
      sinon.assert.notCalled(helmet.hpkp)
      sinon.assert.notCalled(helmet.noCache)
    })

    it('lets you disable a default middleware', function () {
      helmet({ frameguard: false })

      sinon.assert.notCalled(helmet.frameguard)

      sinon.assert.calledOnce(helmet.dnsPrefetchControl)
      sinon.assert.calledOnce(helmet.hidePoweredBy)
      sinon.assert.calledOnce(helmet.hsts)
      sinon.assert.calledOnce(helmet.ieNoOpen)
      sinon.assert.calledOnce(helmet.noSniff)
      sinon.assert.calledOnce(helmet.xssFilter)
      sinon.assert.calledWith(helmet.dnsPrefetchControl, {})
      sinon.assert.calledWith(helmet.hidePoweredBy, {})
      sinon.assert.calledWith(helmet.hsts, {})
      sinon.assert.calledWith(helmet.ieNoOpen, {})
      sinon.assert.calledWith(helmet.noSniff, {})
      sinon.assert.calledWith(helmet.xssFilter, {})
      sinon.assert.notCalled(helmet.contentSecurityPolicy)
      sinon.assert.notCalled(helmet.hpkp)
      sinon.assert.notCalled(helmet.noCache)
    })

    it('lets you enable a normally-disabled middleware', function () {
      helmet({ noCache: true })

      sinon.assert.calledOnce(helmet.noCache)
      sinon.assert.calledWith(helmet.noCache, {})

      sinon.assert.calledOnce(helmet.dnsPrefetchControl)
      sinon.assert.calledOnce(helmet.frameguard)
      sinon.assert.calledOnce(helmet.hidePoweredBy)
      sinon.assert.calledOnce(helmet.hsts)
      sinon.assert.calledOnce(helmet.ieNoOpen)
      sinon.assert.calledOnce(helmet.noSniff)
      sinon.assert.calledOnce(helmet.xssFilter)
      sinon.assert.calledWith(helmet.dnsPrefetchControl, {})
      sinon.assert.calledWith(helmet.frameguard, {})
      sinon.assert.calledWith(helmet.hidePoweredBy, {})
      sinon.assert.calledWith(helmet.hsts, {})
      sinon.assert.calledWith(helmet.ieNoOpen, {})
      sinon.assert.calledWith(helmet.noSniff, {})
      sinon.assert.calledWith(helmet.xssFilter, {})
      sinon.assert.notCalled(helmet.contentSecurityPolicy)
      sinon.assert.notCalled(helmet.hpkp)
    })

    it('lets you set options for a default middleware', function () {
      var options = { action: 'deny' }

      helmet({ frameguard: options })

      sinon.assert.calledOnce(helmet.frameguard)
      sinon.assert.calledWith(helmet.frameguard, options)

      sinon.assert.calledOnce(helmet.dnsPrefetchControl)
      sinon.assert.calledOnce(helmet.hidePoweredBy)
      sinon.assert.calledOnce(helmet.hsts)
      sinon.assert.calledOnce(helmet.ieNoOpen)
      sinon.assert.calledOnce(helmet.noSniff)
      sinon.assert.calledOnce(helmet.xssFilter)
      sinon.assert.calledWith(helmet.dnsPrefetchControl, {})
      sinon.assert.calledWith(helmet.hidePoweredBy, {})
      sinon.assert.calledWith(helmet.hsts, {})
      sinon.assert.calledWith(helmet.ieNoOpen, {})
      sinon.assert.calledWith(helmet.noSniff, {})
      sinon.assert.calledWith(helmet.xssFilter, {})
      sinon.assert.notCalled(helmet.contentSecurityPolicy)
      sinon.assert.notCalled(helmet.hpkp)
      sinon.assert.notCalled(helmet.noCache)
    })

    it('lets you set options for a non-default middleware', function () {
      var options = {
        directives: {
          defaultSrc: ['*']
        }
      }

      helmet({ contentSecurityPolicy: options })

      sinon.assert.calledOnce(helmet.contentSecurityPolicy)
      sinon.assert.calledWith(helmet.contentSecurityPolicy, options)

      sinon.assert.calledOnce(helmet.dnsPrefetchControl)
      sinon.assert.calledOnce(helmet.frameguard)
      sinon.assert.calledOnce(helmet.hidePoweredBy)
      sinon.assert.calledOnce(helmet.hsts)
      sinon.assert.calledOnce(helmet.ieNoOpen)
      sinon.assert.calledOnce(helmet.noSniff)
      sinon.assert.calledOnce(helmet.xssFilter)
      sinon.assert.calledWith(helmet.dnsPrefetchControl, {})
      sinon.assert.calledWith(helmet.frameguard, {})
      sinon.assert.calledWith(helmet.hidePoweredBy, {})
      sinon.assert.calledWith(helmet.hsts, {})
      sinon.assert.calledWith(helmet.ieNoOpen, {})
      sinon.assert.calledWith(helmet.noSniff, {})
      sinon.assert.calledWith(helmet.xssFilter, {})
      sinon.assert.notCalled(helmet.hpkp)
      sinon.assert.notCalled(helmet.noCache)
    })
  })
})
