var helmet = require('../');

var assert = require('assert');

describe('deprecated methods', function () {

    var deprecatedList = ['iexss', 'contentTypeOptions', 'cacheControl'];

    deprecatedList.forEach(function (deprecated) {
        it(deprecated + ' is deprecated', function() {
            assert.throws(function () {
                helmet[deprecated]();
            });
        });
    });

});
