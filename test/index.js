const helmet = require('..')

const assert = require('assert')
const sinon = require('sinon')

describe('helmet', function () {
  beforeEach(function () {
    this.sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    this.sandbox.restore()
  })

  describe('module aliases', function () {
    it('aliases "dns-prefetch-control"', function () {
      const pkg = require('dns-prefetch-control')
      assert.equal(helmet.dnsPrefetchControl, pkg)
    })

    it('aliases "dont-sniff-mimetype"', function () {
      const pkg = require('dont-sniff-mimetype')
      assert.equal(helmet.noSniff, pkg)
    })

    it('aliases "expect-ct"', function () {
      const pkg = require('expect-ct')
      assert.equal(helmet.expectCt, pkg)
    })

    it('aliases "helmet-crossdomain"', function () {
      const pkg = require('helmet-crossdomain')
      assert.equal(helmet.permittedCrossDomainPolicies, pkg)
    })

    it('aliases "frameguard"', function () {
      const pkg = require('frameguard')
      assert.equal(helmet.frameguard, pkg)
    })

    it('aliases "helmet-csp"', function () {
      const pkg = require('helmet-csp')
      assert.equal(helmet.contentSecurityPolicy, pkg)
    })

    it('aliases "hide-powered-by"', function () {
      const pkg = require('hide-powered-by')
      assert.equal(helmet.hidePoweredBy, pkg)
    })

    it('aliases "hpkp"', function () {
      const pkg = require('hpkp')
      assert.equal(helmet.hpkp, pkg)
    })

    it('aliases "hsts"', function () {
      const pkg = require('hsts')
      assert.equal(helmet.hsts, pkg)
    })

    it('aliases "ienoopen"', function () {
      const pkg = require('ienoopen')
      assert.equal(helmet.ieNoOpen, pkg)
    })

    it('aliases "nocache"', function () {
      const pkg = require('nocache')
      assert.equal(helmet.noCache, pkg)
    })

    it('aliases "referrer-policy"', function () {
      const pkg = require('referrer-policy')
      assert.equal(helmet.referrerPolicy, pkg)
    })

    it('aliases "x-xss-protection"', function () {
      const pkg = require('x-xss-protection')
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
      sinon.assert.notCalled(helmet.expectCt)
      sinon.assert.notCalled(helmet.hpkp)
      sinon.assert.notCalled(helmet.noCache)
      sinon.assert.notCalled(helmet.permittedCrossDomainPolicies)
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
      sinon.assert.notCalled(helmet.expectCt)
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
      sinon.assert.notCalled(helmet.expectCt)
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
      sinon.assert.notCalled(helmet.expectCt)
      sinon.assert.notCalled(helmet.hpkp)
      sinon.assert.notCalled(helmet.noCache)
      sinon.assert.notCalled(helmet.permittedCrossDomainPolicies)
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
      sinon.assert.notCalled(helmet.expectCt)
      sinon.assert.notCalled(helmet.hpkp)
      sinon.assert.notCalled(helmet.noCache)
      sinon.assert.notCalled(helmet.permittedCrossDomainPolicies)
    })

    it('errors when `use`d directly', function () {
      var fakeRequest = {
        constructor: {
          name: 'IncomingMessage'
        }
      }

      assert.throws(function () {
        helmet(fakeRequest)
      })
    })

    it('names its function and middleware', function () {
      assert.equal(helmet.name, 'helmet')
      assert.equal(helmet.name, helmet().name)
    })
  })
})
