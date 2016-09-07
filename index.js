var connect = require('connect')

var config = require('./config')
var values = require('./lib/values')

var middlewares = values(config.middlewares)

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

helmet.dnsPrefetchControl = require('dns-prefetch-control')
helmet.noSniff = require('dont-sniff-mimetype')
helmet.frameguard = require('frameguard')
helmet.contentSecurityPolicy = require('helmet-csp')
helmet.hidePoweredBy = require('hide-powered-by')
helmet.hpkp = require('hpkp')
helmet.hsts = require('hsts')
helmet.ieNoOpen = require('ienoopen')
helmet.noCache = require('nocache')
helmet.xssFilter = require('x-xss-protection')

module.exports = helmet
