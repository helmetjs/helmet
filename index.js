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
  var aliases = config.middlewares[moduleName]
  helmet[moduleName] = pkg
  aliases.forEach(function (aliasName) {
    helmet[aliasName] = pkg
  })
})

module.exports = helmet
