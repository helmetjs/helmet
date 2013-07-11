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
    overrides = overrides || {csp: false};
    middleware.forEach(function _eachMiddleware(m) {
        if (overrides[m] !== false) {
            app.use(require('./middleware/' + m)());
        }
    });
};
