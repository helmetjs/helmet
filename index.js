/* jshint node: true */
/* jshint asi: true */
var connect = require('connect')

var config = require('./config.json')

function findModuleName(alias) {
  'use strict';
  var result = null;
  Object.keys(config.middlewares).forEach(function (moduleName) {
    if (alias === moduleName || config.middlewares[moduleName].indexOf(alias) > -1) {
      result = moduleName
    }
  })
  return result
}

function helmet (optionOverrides) {
  'use strict';
  var chain = connect()

  // init options for default middleware
  var options = {}
  config.defaultMiddleware.forEach(function (middlewareName) {
    var moduleName = findModuleName(middlewareName)
    // TODO: initialize with real default props from module?
    options[moduleName] = {}
  })

  // override options with settings provided externally
  Object.keys(optionOverrides).forEach(function (middlewareName) {
    var overrides = optionOverrides[middlewareName]
    var moduleName = findModuleName(middlewareName)
    // console.log(middlewareName)
    // console.log(moduleName)
    // console.log(overrides)
    if (typeof overrides === 'boolean') {
      if (overrides) {
        // TODO: initialize with real default props from module?
        options[moduleName] = {}
      } else {
        delete options[moduleName]
      }
    } else {
      options[moduleName] = overrides
    }
  })

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
  'use strict';
  var pkg = require(moduleName)
  var aliases = config.middlewares[moduleName]
  helmet[moduleName] = pkg
  aliases.forEach(function (aliasName) {
    helmet[aliasName] = pkg
  })
})

module.exports = helmet
