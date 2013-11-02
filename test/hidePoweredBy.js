var helmet = require('../');
var assert = require('assert');
var sinon = require('sinon');

describe('hidePoweredBy', function () {

    var req, res, next, middleware;
    beforeEach(function () {
        middleware = helmet.hidePoweredBy();
        res = { removeHeader: sinon.spy() };
        next = sinon.spy();
    });

    afterEach(function () {
        assert(next.calledOnce);
    });

    it('removes the X-Powered-By header', function () {
        middleware(req, res, next);
        assert(res.removeHeader.calledOnce);
        var args = res.removeHeader.firstCall.args;
        assert(args.length == 1);
        assert(args[0].toLowerCase() == 'x-powered-by');
    });

});
