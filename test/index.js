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

    it('aliases "x-xss-protection"', function () {
      var pkg = require('x-xss-protection')
      assert.equal(helmet.xssFilter, pkg)
    })
  })

  describe('helmet()', function () {
    it('chains all default middleware', function () {
      Object.keys(helmet).forEach(function (key) {
        if (typeof helmet[key] === 'function') {
          this.sandbox.spy(helmet, key)
        }
      }.bind(this))

      helmet()

      sinon.assert.calledOnce(helmet.dnsPrefetchControl)
      sinon.assert.calledOnce(helmet.frameguard)
      sinon.assert.calledOnce(helmet.hidePoweredBy)
      sinon.assert.calledOnce(helmet.hsts)
      sinon.assert.calledOnce(helmet.ieNoOpen)
      sinon.assert.calledOnce(helmet.noSniff)
      sinon.assert.calledOnce(helmet.xssFilter)

      sinon.assert.notCalled(helmet.contentSecurityPolicy)
      sinon.assert.notCalled(helmet.hpkp)
      sinon.assert.notCalled(helmet.noCache)
    })
  })
})
