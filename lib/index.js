var fs = require('fs');
var path = require('path');
var connect = require('connect');

var middlewares = [];

function helmet(overrides) {
  overrides = overrides || { csp: false };
  var result = connect();
  middlewares.forEach(function (name) {
    if (false !== overrides[name]) {
      result.use(helmet[name]());
    }
  });
  return result;
}

var middlewarePath = path.resolve(__dirname, 'middleware');
var middlewareFiles = fs.readdirSync(middlewarePath);
middlewareFiles.forEach(function (filename) {
  if ('.js' === path.extname(filename)) {
    var name = path.basename(filename, '.js');
    helmet[name] = require(path.resolve(middlewarePath, filename));
    middlewares.push(name);
  }
});

module.exports = helmet;
