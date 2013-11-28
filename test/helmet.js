var helmet = require('../');
var assert = require('assert');

var middlewares = [
    'cacheControl',
    'contentTypeOptions',
    'csp',
    'hidePoweredBy',
    'hsts',
    'ienoopen',
    'iexss',
    'xframe'
];

describe('helmet object', function () {

    middlewares.forEach(function (middlewareName) {

        it('has the ' + middlewareName + ' middleware', function () {
            var middleware = require('../lib/middleware/' + middlewareName);
            assert.strictEqual(helmet[middlewareName], middleware);
        });

    });

    it('has a function called "defaults"', function () {
        assert(helmet.defaults instanceof Function);
    });

});


