var deprecate = require('depd')('helmet');
var middleware = require('helmet-crossdomain');

module.exports = function deprecated() {
  deprecate('helmet.crossdomain is deprecated and will be removed in 1.0');
  return middleware.apply(this, arguments);
};
