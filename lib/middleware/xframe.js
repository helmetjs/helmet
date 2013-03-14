/*
## X-FRAME-OPTIONS

  * Defaults to DENY
  * xframe('sameorigin') use SAMEORIGIN
  * xframe('allow-from', 'http://example.com') to specify allow-from values

*/
module.exports = function (action, options) {
    var header = 'DENY';

    if (action) {
        action = action.toUpperCase();
    }

    if (action == 'SAMEORIGIN') {
        header = 'SAMEORIGIN';
    } else if ((action == 'ALLOW-FROM' || action == 'ALLOWFROM') && options) {
        header = 'ALLOW-FROM ' + options;
    }

    return function (req, res, next)  {
        res.header('X-FRAME-OPTIONS', header);
        next();
    };
};
