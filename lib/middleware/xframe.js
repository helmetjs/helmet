/*
## X-FRAME-OPTIONS

  * Defaults to DENY
  * xframe('sameorigin') use SAMEORIGIN
  * xframe('allow-from', 'http://example.com') to specify allow-from values

*/

function isString(value) {
    var type = Object.prototype.toString.call(value);
    return type === "[object String]";
}

module.exports = function xframe(action, options) {

    var header;

    if (typeof action === "undefined") {
        header = 'DENY';
    } else if (isString(action)) {
        header = action.toUpperCase();
    }

    if (header == 'ALLOWFROM') {
        header = 'ALLOW-FROM';
    }

    if (['DENY', 'ALLOW-FROM', 'SAMEORIGIN'].indexOf(header) === -1) {
        throw new Error('X-Frame must be undefined, "DENY", "ALLOW-FROM", or "SAMEORIGIN"');
    }

    if (header == 'ALLOW-FROM') {
        if (!isString(options)) {
            throw new Error("X-Frame's ALLOW-FROM requires a second parameter");
        }
    }

    if (header == 'ALLOW-FROM') {
        header = 'ALLOW-FROM ' + options;
    }

    return function xframe(req, res, next)  {
        res.setHeader('X-FRAME-OPTIONS', header);
        next();
    };

};
