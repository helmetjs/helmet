var helmet = require('../');
var assert = require('assert');
var sinon = require('sinon');

describe('xframe', function () {

    var req, res, next;
    beforeEach(function () {
        res = { header: sinon.spy() };
        next = sinon.spy();
    });

    describe('with proper input', function () {

        afterEach(function () {
            assert(next.calledOnce);
        });

        it('sets header to DENY with no arguments', function () {
            var middleware = helmet.xframe();
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'DENY').calledOnce);
        });

        it('sets header to DENY when called with lowercase "deny"', function () {
            var middleware = helmet.xframe('deny');
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'DENY').calledOnce);
        });

        it('sets header to DENY when called with uppercase "DENY"', function () {
            var middleware = helmet.xframe('DENY');
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'DENY').calledOnce);
        });

        it('sets header to SAMEORIGIN when called with lowercase "sameorigin"', function () {
            var middleware = helmet.xframe('sameorigin');
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'SAMEORIGIN').calledOnce);
        });

        it('sets header to SAMEORIGIN when called with uppercase "SAMEORIGIN"', function () {
            var middleware = helmet.xframe('SAMEORIGIN');
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'SAMEORIGIN').calledOnce);
        });

        it('sets header properly when called with lowercase "allow-from"', function () {
            var middleware = helmet.xframe('allow-from', 'http://example.com');
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'ALLOW-FROM http://example.com').calledOnce);
        });

        it('sets header properly when called with uppercase "ALLOW-FROM"', function () {
            var middleware = helmet.xframe('ALLOW-FROM', 'http://example.com');
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'ALLOW-FROM http://example.com').calledOnce);
        });

        it('sets header properly when called with lowercase "allowfrom"', function () {
            var middleware = helmet.xframe('allowfrom', 'http://example.com');
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'ALLOW-FROM http://example.com').calledOnce);
        });

        it('sets header properly when called with uppercase "ALLOWFROM"', function () {
            var middleware = helmet.xframe('ALLOWFROM', 'http://example.com');
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'ALLOW-FROM http://example.com').calledOnce);
        });

        it("works with String objects and doesn't change them", function () {
            var str = new String('SAMEORIGIN');
            var middleware = helmet.xframe(str);
            middleware(req, res, next);
            assert(res.header.withArgs('X-FRAME-OPTIONS', 'SAMEORIGIN').calledOnce);
            assert.equal(str, 'SAMEORIGIN');
        });

    });

    describe('with improper input', function () {

        function callWith() {
            var args = arguments;
            return function () {
                return helmet.xframe.apply(helmet, args);
            };
        }

        it('fails with a bad first argument', function () {
            assert.throws(callWith(' '));
            assert.throws(callWith('denyy'));
            assert.throws(callWith('DENNY'));
            assert.throws(callWith(123));
            assert.throws(callWith(false));
            assert.throws(callWith(null));
            assert.throws(callWith({}));
            assert.throws(callWith([]));
            assert.throws(callWith(['ALLOW-FROM', 'http://example.com']));
            assert.throws(callWith(/cool_regex/g));
        });

        it('fails with a bad second argument if the first is "ALLOW-FROM"', function () {
            assert.throws(callWith('ALLOW-FROM'));
            assert.throws(callWith('ALLOW-FROM', null));
            assert.throws(callWith('ALLOW-FROM', false));
        });

    });

});
