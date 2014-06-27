var fs = require('fs');
var path = require('path');
var connect = require('connect');

var sixMonthsIsh = 15768000000;

var middlewares;

function helmet(overrides) {
    overrides = overrides || { csp: false };
    var result = connect();
    middlewares.forEach(function (name) {
        if (false !== overrides[name]) {
            var fn = helmet[name];
            if ('hsts' === name) {
                result.use(fn({ maxAge: sixMonthsIsh }));
            } else {
                result.use(fn());
            }
        }
    });
    return result;
}

var deprecated = [
    { gone: 'iexss', instead: 'xssFilter' },
    { gone: 'contentTypeOptions', instead: 'nosniff' },
    { gone: 'cacheControl', instead: 'nocache' },
    { gone: 'defaults', instead: 'helmet()' }
];
deprecated.forEach(function (method) {
    var gone = method.gone;
    var instead = method.instead;
    helmet[gone] = function () {
        throw new Error(gone + ' has been deprecated. Please use ' + instead + ' instead');
    };
});

var middlewarePath = path.resolve(__dirname, 'middleware');
var middlewareFiles = fs.readdirSync(middlewarePath);
middlewares = middlewareFiles.map(function (filename) {
    if ('.js' === path.extname(filename)) {
        var name = path.basename(filename, '.js');
        helmet[name] = require(path.resolve(middlewarePath, filename));
        return name;
    }
});

module.exports = helmet;
