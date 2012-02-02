/*
## X-FRAME-OPTIONS

  * Defaults to DENY
  * Set {SAMEORIGIN: true} to use SAMEORIGIN
  * Set {'ALLOW-FROM': 'http://andyet.net'} to specify allow-from values

*/
module.exports = function(options) {
    var header = 'DENY';
    if (options && options.hasOwnProperty('sameorigin')) {
        header = 'SAMEORIGIN'
    } else if (options && options.hasOwnProperty('allow-from')) {
        header = 'ALLOW-FROM ' + options['allow-from'];
    }

    return function (req, res, next)  {
        res.header('X-FRAME-OPTIONS', header);
        next();
    };
};
