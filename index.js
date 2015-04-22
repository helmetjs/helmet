var connect = require('connect');

var crossdomain = require('./lib/deprecated-crossdomain');
var config = require('./config.json');

function helmet() {
  var chain = connect();
  config.defaultMiddleware.forEach(function(middlewareName) {
    chain.use(helmet[middlewareName]());
  });
  return chain;
}

Object.keys(config.middlewares).forEach(function(moduleName) {
  var pkg = require(moduleName);
  var aliases = config.middlewares[moduleName];
  helmet[moduleName] = pkg;
  aliases.forEach(function(aliasName) {
    helmet[aliasName] = pkg;
  });
});

helmet.crossdomain = helmet.crossDomain = crossdomain;

module.exports = helmet;
