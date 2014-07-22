module.exports = function nocache(options) {

  options = options || {};
  var noEtag = options.noEtag;

  return function nocache(req, res, next)  {
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (noEtag) {
      res.removeHeader('ETag');
    }
    next();
  };

};
