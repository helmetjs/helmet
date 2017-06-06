var connect = require('connect')

var DEFAULT_MIDDLEWARE = [
  'dnsPrefetchControl',
  'frameguard',
  'hidePoweredBy',
  'hsts',
  'ieNoOpen',
  'noSniff',
  'xssFilter'
]

var middlewares
function helmet (options) {
  options = options || {}

  if (options.constructor.name === 'IncomingMessage') {
    throw new Error('It appears you have done something like `app.use(helmet)`, but it should be `app.use(helmet())`.')
  }

  var chain = connect()

  middlewares.forEach(function (middlewareName) {
    var middleware = helmet[middlewareName]
    var middlewareOptions = options[middlewareName]
    var isDefault = DEFAULT_MIDDLEWARE.indexOf(middlewareName) !== -1

    if (middlewareOptions === false) {
      return
    } else if (middlewareOptions === true) {
      middlewareOptions = {}
    }

    if (middlewareOptions != null) {
      chain.use(middleware(middlewareOptions))
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
