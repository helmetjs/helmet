var _ = require('underscore');

var oneDay = 86400000;

module.exports = function hsts(options) {

  options = options || {};

  var maxAgeMS = (options.maxAge != null ? options.maxAge : oneDay);
  var force = options.force;
  var setIf = options.setIf;

  if (options.maxage != null) {
    throw new Error('Did you mean to pass "maxAge" instead of "maxage"?');
  }
  if (!_(options).isObject()) {
    throw new Error('HSTS must be passed an object or undefined.');
  }
  if (arguments.length > 1) {
    throw new Error('HSTS passed the wrong number of arguments.');
  }

  if (!_(maxAgeMS).isNumber()) {
    throw new TypeError('HSTS must be passed a numeric maxAge parameter.');
  }
  if (maxAgeMS < 0) {
    throw new RangeError('HSTS maxAge must be nonnegative.');
  }
  if (setIf && !_(setIf).isFunction()) {
    throw new TypeError('setIf must be a function.');
  }
  if (setIf && force) {
    throw new Error('setIf and force cannot both be specified.');
  }

  var maxAge = Math.round(maxAgeMS / 1000);
  var header = 'max-age=' + maxAge;
  if (options.includeSubdomains) {
    header += '; includeSubdomains';
  }
  if (options.preload) {
    header += '; preload';
  }

  return function hsts(req, res, next)  {

    var setHeader;
    if (setIf) {
      setHeader = setIf(req, res);
    } else {
      setHeader = force || req.secure;
    }

    if (setHeader) {
      res.setHeader('Strict-Transport-Security', header);
    }

    next();

  };

};

