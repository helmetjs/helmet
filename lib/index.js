var fs = require('fs');
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

exports.defaults = function (app, overrides) {
    if (!app || typeof app.use !== 'function') {
        overrides = app;
        try {   // make sub-app, in likeliest framework(s)
            app = require('express')();
        } catch (e) {
            app = require('connect')();
        }
    }
    overrides = overrides || {csp: false};
    middleware.forEach(function _eachMiddleware(m) {
        if (overrides[m] !== false) {
            app.use(require('./middleware/' + m)());
        }
    });
    return app;
};
