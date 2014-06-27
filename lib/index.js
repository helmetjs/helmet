var fs = require('fs');

var deprecated = [
    { gone: 'iexss', instead: 'xssFilter' },
    { gone: 'contentTypeOptions', instead: 'nosniff' },
    { gone: 'cacheControl', instead: 'nocache' }
];

var middleware = [];
fs.readdirSync(__dirname + '/middleware').forEach(function (filename) {
    if (/\.js$/.test(filename)) {
        var name = filename.substr(0, filename.lastIndexOf('.'));
        middleware.push(name);
        exports.__defineGetter__(name, function () {
            return require('./middleware/' + name);
        });
    }
});

deprecated.forEach(function (method) {
    var gone = method.gone;
    var instead = method.instead;
    exports[gone] = function () {
        throw new Error(gone + ' has been deprecated. Please use ' + instead + ' instead');
    };
});

exports.defaults = function (app, overrides) {

    if (!app || typeof app.use !== 'function') {
        overrides = app;
        try {  // make sub-app, in likeliest framework(s)
            app = require('express')();
        } catch (e) {
            app = require('connect')();
        }
    }

    overrides = overrides || { csp: false };

    middleware.forEach(function _eachMiddleware(m) {
        if (overrides[m] !== false) {
            if (m == 'hsts') {
                var sixMonthsIsh = 15768000000;
                app.use(require('./middleware/' + m)(sixMonthsIsh));
            } else {
                app.use(require('./middleware/' + m)());
            }
        }
    });

    return app;

};
