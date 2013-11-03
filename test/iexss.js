var helmet = require('../');
var assert = require('assert');
var sinon = require('sinon');

describe('iexss', function () {

    var req, res, next, middleware;
    beforeEach(function () {
        middleware = helmet.iexss();
        res = { header: sinon.spy() };
        next = sinon.spy();
    });

    afterEach(function () {
        assert(next.calledOnce);
    });

    it('sets header properly', function () {
        middleware(req, res, next);
        assert(res.header.withArgs('X-XSS-Protection', '1; mode=block').calledOnce);
    });

});
