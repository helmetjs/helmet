var _ = require('underscore');

module.exports = function xframe(action, options) {

  var header;

  if (typeof action === 'undefined') {
    header = 'DENY';
  } else if (_.isString(action)) {
    header = action.toUpperCase();
  }

  if (header === 'ALLOWFROM') {
    header = 'ALLOW-FROM';
  }

  if (['DENY', 'ALLOW-FROM', 'SAMEORIGIN'].indexOf(header) === -1) {
    throw new Error('X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"');
  }

  if (header === 'ALLOW-FROM') {
    if (!_.isString(options)) {
      throw new Error('X-Frame: ALLOW-FROM requires a second parameter');
    }
    header = 'ALLOW-FROM ' + options;
  }

  return function xframe(req, res, next)  {
    res.setHeader('X-Frame-Options', header);
    next();
  };

};
