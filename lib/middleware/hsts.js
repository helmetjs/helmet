var _ = require('underscore');

module.exports = function hsts(options) {

    options = options || {};
    var maxAgeMS = options.maxAge;
    var force = options.force;
    var setIf = options.setIf;

    if (!_(maxAgeMS).isNumber()) {
        throw new TypeError('HSTS must be passed a numeric maxAge parameter.');
    }
    if (maxAgeMS <= 0) {
        throw new RangeError('HSTS maxAge must be positive.');
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

