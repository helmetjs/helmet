var connect = require('connect')

var config = require('./config.json')

function helmet (optionOverrides) {
  'use strict'
  var chain = connect()

  // reverse lookup for alias to moduleName
  var aliases = {}
  Object.keys(config.middlewares).forEach(function (moduleName) {
    aliases[moduleName] = moduleName
    config.middlewares[moduleName].forEach(function (alias) {
      aliases[alias] = moduleName
    })
  })

  // init options for default middleware
  var options = {}
  config.defaultMiddleware.forEach(function (middlewareName) {
    var moduleName = aliases[middlewareName]
    options[moduleName] = {}
  })

  // override options with settings provided externally
  if (optionOverrides) {
    Object.keys(optionOverrides).forEach(function (middlewareName) {
      var overrides = optionOverrides[middlewareName]
      var moduleName = aliases[middlewareName]
      if (typeof overrides === 'boolean') {
        if (overrides) {
          options[moduleName] = {}
        } else {
          delete options[moduleName]
        }
      } else {
        options[moduleName] = overrides
      }
    })
  }

  // build chain of helmet modules
  Object.keys(options).forEach(function (moduleName) {
    chain.use(helmet[moduleName](
      // don't pass in empty object
      Object.keys(options[moduleName]).length ? options[moduleName] : undefined
    ))
  })

  return chain
}

Object.keys(config.middlewares).forEach(function (moduleName) {
  'use strict'
  var pkg = require(moduleName)
  var aliases = config.middlewares[moduleName]
  helmet[moduleName] = pkg
  aliases.forEach(function (aliasName) {
    helmet[aliasName] = pkg
  })
})

module.exports = helmet
