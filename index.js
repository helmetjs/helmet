var connect = require('connect')

var config = require('./config.json')

function helmet () {
  var chain = connect()
  config.defaultMiddleware.forEach(function (middlewareName) {
    chain.use(helmet[middlewareName]())
  })
  return chain
}

Object.keys(config.middlewares).forEach(function (moduleName) {
  var pkg = require(moduleName)
  var alias = config.middlewares[moduleName]
  helmet[alias] = pkg
})

module.exports = helmet
