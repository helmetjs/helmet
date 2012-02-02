/*
## X-FRAME-OPTIONS

  * Defaults to DENY
  * Set {SAMEORIGIN: true} to use SAMEORIGIN
  * Set {'ALLOW-FROM': 'http://andyet.net'} to specify allow-from values

*/
module.exports = function(options) {
    var header = 'DENY';
    if (options && options.hasOwnProperty('SAMEORIGIN')) {
        header = 'SAMEORIGIN'
    } else if (options && options.hasOwnProperty('ALLOW-FROM')) {
        header = 'ALLOW-FROM ' + options['ALLOW-FROM'];
    }

    return function (req, res, next)  {
        res.header('X-FRAME-OPTIONS', header);
        next();
    };
};
