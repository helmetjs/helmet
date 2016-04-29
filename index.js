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

Object.keys(config.middlewares).forEach(function (moduleName) {
  var pkg = require(moduleName)
  var alias = config.middlewares[moduleName]
  helmet[alias] = pkg
})

module.exports = helmet
