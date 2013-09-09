/*
## X-FRAME-OPTIONS

  * Defaults to DENY
  * xframe('sameorigin') use SAMEORIGIN
  * xframe('allow-from', 'http://example.com') to specify allow-from values

*/

var _ = require('lodash');

module.exports = function (action, options) {

    var header;

    if (_(action).isUndefined()) {
        header = 'DENY';
    } else if (_(action).isString()) {
        header = action.toUpperCase();
    }

    if (header == 'ALLOWFROM') {
        header = 'ALLOW-FROM';
    }

    if (!_(['DENY', 'ALLOW-FROM', 'SAMEORIGIN']).contains(header)) {
        throw new Error('X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"');
    }

    if (header == 'ALLOW-FROM') {
        if (!_(options).isString()) {
            throw new Error("X-Frame's ALLOW-FROM requires a second parameter");
        }
    }

    if (header == 'ALLOW-FROM') {
        header = 'ALLOW-FROM ' + options;
    }

    return function (req, res, next)  {
        res.header('X-FRAME-OPTIONS', header);
        next();
    };
};
