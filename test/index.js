const helmet = require('..')

const assert = require('assert')
const sinon = require('sinon')
const connect = require('connect')
const request = require('supertest')

describe('helmet', function () {
  beforeEach(function () {
    this.sandbox = sinon.createSandbox()
  })

  afterEach(function () {
    this.sandbox.restore()
  })

  describe('module aliases', function () {
    it('aliases "dns-prefetch-control"', function () {
      const pkg = require('dns-prefetch-control')
      assert.strictEqual(helmet.dnsPrefetchControl, pkg)
    })

    it('aliases "dont-sniff-mimetype"', function () {
      const pkg = require('dont-sniff-mimetype')
      assert.strictEqual(helmet.noSniff, pkg)
    })

    it('aliases "expect-ct"', function () {
      const pkg = require('expect-ct')
      assert.strictEqual(helmet.expectCt, pkg)
    })

    it('aliases "feature-policy"', function () {
      const pkg = require('feature-policy')
      assert.strictEqual(helmet.featurePolicy, pkg)
    })

    it('aliases "helmet-crossdomain"', function () {
      const pkg = require('helmet-crossdomain')
      assert.strictEqual(helmet.permittedCrossDomainPolicies, pkg)
    })

    it('aliases "frameguard"', function () {
      const pkg = require('frameguard')
      assert.strictEqual(helmet.frameguard, pkg)
    })

    it('aliases "helmet-csp"', function () {
      const pkg = require('helmet-csp')
      assert.strictEqual(helmet.contentSecurityPolicy, pkg)
    })

    it('aliases "hide-powered-by"', function () {
      const pkg = require('hide-powered-by')
      assert.strictEqual(helmet.hidePoweredBy, pkg)
    })

    // This test will be removed in helmet@4.
    it('calls through to hpkp but emits a deprecation warning', function () {
      const deprecationPromise = new Promise(resolve => {
        process.on('deprecation', (deprecationError) => {
          assert(deprecationError.message.indexOf('You can use the `hpkp` module instead.') !== -1)
          resolve()
        })
      })

      const app = connect()
      app.use(helmet.hpkp({ maxAge: 10, sha256s: ['abc123', 'xyz456'] }))
      app.use((req, res) => {
        res.end('Hello world!')
      })
      const supertestPromise = request(app).get('/')
        .expect(200)
        .expect('Public-Key-Pins', 'pin-sha256="abc123"; pin-sha256="xyz456"; max-age=10')
        .expect('Hello world!')

      return Promise.all([deprecationPromise, supertestPromise])
    })

    it('aliases "hsts"', function () {
      const pkg = require('hsts')
      assert.strictEqual(helmet.hsts, pkg)
    })

    it('aliases "ienoopen"', function () {
      const pkg = require('ienoopen')
      assert.strictEqual(helmet.ieNoOpen, pkg)
    })

    it('aliases "nocache"', function () {
      const pkg = require('nocache')
      assert.strictEqual(helmet.noCache, pkg)
    })

    it('aliases "referrer-policy"', function () {
      const pkg = require('referrer-policy')
      assert.strictEqual(helmet.referrerPolicy, pkg)
    })

    it('aliases "x-xss-protection"', function () {
      const pkg = require('x-xss-protection')
      assert.strictEqual(helmet.xssFilter, pkg)
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
      assert.strictEqual(helmet.name, 'helmet')
      assert.strictEqual(helmet.name, helmet().name)
    })
  })
})
