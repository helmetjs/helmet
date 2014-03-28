var platform = require('platform');

module.exports = function (options) {

    options = options || {};
    var setOnOldIE = options.setOnOldIE;

    return function (req, res, next)  {

        var browser = platform.parse(req.headers['user-agent']);
        var version = parseFloat(browser.version);
        var isIE = browser.name == 'IE';

        var value;
        if ((!isIE) || (version >= 9) || (setOnOldIE)) {
            value = '1; mode=block';
        } else {
            value = '0';
        }

        res.setHeader('X-XSS-Protection', value);
        next();

    };

};
