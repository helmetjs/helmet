var connect = require('connect')

var config = require('./config')

var middlewares
function helmet (options) {
  options = options || {}

  var chain = connect()

  middlewares.forEach(function (middlewareName) {
    var middleware = helmet[middlewareName]
    var option = options[middlewareName]
    var isDefault = config.defaultMiddleware.indexOf(middlewareName) !== -1

    if (option === false) { return }

    if (option != null) {
      if (option === true) {
        chain.use(middleware({}))
      } else {
        chain.use(middleware(option))
      }
    } else if (isDefault) {
      chain.use(middleware({}))
    }
  })

  return chain
}

helmet.contentSecurityPolicy = require('helmet-csp')
helmet.dnsPrefetchControl = require('dns-prefetch-control')
helmet.expectCt = require('expect-ct')
helmet.frameguard = require('frameguard')
helmet.hidePoweredBy = require('hide-powered-by')
helmet.hpkp = require('hpkp')
helmet.hsts = require('hsts')
helmet.ieNoOpen = require('ienoopen')
helmet.noCache = require('nocache')
helmet.noSniff = require('dont-sniff-mimetype')
helmet.referrerPolicy = require('referrer-policy')
helmet.xssFilter = require('x-xss-protection')
middlewares = Object.keys(helmet)

module.exports = helmet
