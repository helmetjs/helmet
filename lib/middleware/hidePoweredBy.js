module.exports = function hidePoweredBy(options) {
  return function hidePoweredBy(req, res, next) {
    options = (options || {});
    var setTo = options.setTo;

    if (setTo) {
      res.setHeader('X-Powered-By', setTo);
    } else {
      res.removeHeader('X-Powered-By');
    }

    next();
  };
};
