// These tests, unlike others, require mocking of requests and responses.
// Because this header should only be set for HTTPS and that's hard to
// reliably determine, heuristics are used.

var helmet = require('../');

var assert = require('assert');
var sinon = require('sinon');

describe('hsts', function () {

  var maxAge = 7776000000; // 90 days in milliseconds
  var defaultHeader = 'max-age=' + (maxAge / 1000);

  var handler, req, res, next;
  beforeEach(function () {
    handler = helmet.hsts({ maxAge: maxAge });
    req = {};
    res = { setHeader: sinon.spy() };
    next = sinon.spy();
  });

  it('throws an error with invalid parameters', function () {
    function test(value) {
      assert.throws(function () {
        helmet.hsts(value);
        console.log(value, typeof value);
      }, Error);
    }
    test('1234');
    test(-1234);
    test(1234);
    test(1234, true);
    test({ maxAge: -123 });
    test({ maxAge: '123' });
    test({ maxAge: true });
    test({ setIf: 123 });
    test({ setIf: true });
    test({ setIf: function() {}, force: true });
    test({ maxage: 1234 });
  });

  it('sets a default value to 1 day', function () {
    handler = helmet.hsts();
    req.secure = true;
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', 'max-age=86400'));
  });

  it('can include subdomains with no specified max-age', function () {
    handler = helmet.hsts({ includeSubdomains: true });
    req.secure = true;
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', 'max-age=86400; includeSubdomains'));
  });

  it('can include subdomains and preload with no specified max-age', function () {
    handler = helmet.hsts({ includeSubdomains: true, preload: true });
    req.secure = true;
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', 'max-age=86400; includeSubdomains; preload'));
  });

  it('is unset if req.secure is false', function () {
    req.secure = false;
    handler(req, res, next);
    assert(!res.setHeader.called);
  });

  it('is set if req.secure is true', function () {
    req.secure = true;
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', defaultHeader));
  });

  it('is always set if forced', function () {
    handler = helmet.hsts({ maxAge: maxAge, force: true });
    req.secure = false;
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', defaultHeader));
  });

  it('can be set to -0', function () {
    req.secure = true;
    handler = helmet.hsts({ maxAge: -0 });
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', 'max-age=0'));
  });

  it('can be set to 0', function () {
    req.secure = true;
    handler = helmet.hsts({ maxAge: 0 });
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', 'max-age=0'));
  });

  it('rounds down properly', function () {
    req.secure = true;
    handler = helmet.hsts({ maxAge: 1400 });
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', 'max-age=1'));
  });

  it('rounds up properly', function () {
    req.secure = true;
    handler = helmet.hsts({ maxAge: 600 });
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', 'max-age=1'));
  });

  it('can include subdomains', function () {
    var expectedHeader = defaultHeader + '; includeSubdomains';
    req.secure = true;
    handler = helmet.hsts({ maxAge: maxAge, includeSubdomains: true });
    handler(req, res, next);
    assert(res.setHeader.calledWith('Strict-Transport-Security', expectedHeader));
  });

  it('lets you decide whether it should be set', function () {
    handler = helmet.hsts({
      maxAge: maxAge,
      setIf: function(req) {
        return req.pleaseSet;
      }
    });
    handler(req, res, next);
    req.pleaseSet = true;
    handler(req, res, next);
    assert(res.setHeader.calledOnce);
  });

  it('names its function and middleware', function () {
    assert.equal(helmet.hsts.name, 'hsts');
    assert.equal(helmet.hsts({ maxAge: 1 }).name, 'hsts');
  });

});
