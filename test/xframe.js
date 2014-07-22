var helmet = require('../');

var connect = require('connect');
var request = require('supertest');
var assert = require('assert');

var hello = function (req, res) {
  res.end('Hello world!');
};

describe('xframe', function () {

  var app;
  beforeEach(function () {
    app = connect();
  });

  describe('with proper input', function () {

    it('sets header to DENY with no arguments', function (done) {
      app.use(helmet.xframe()).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'DENY', done);
    });

    it('sets header to DENY when called with lowercase "deny"', function (done) {
      app.use(helmet.xframe('deny')).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'DENY', done);
    });

    it('sets header to DENY when called with uppercase "DENY"', function (done) {
      app.use(helmet.xframe('DENY')).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'DENY', done);
    });

    it('sets header to SAMEORIGIN when called with lowercase "sameorigin"', function (done) {
      app.use(helmet.xframe('sameorigin')).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN', done);
    });

    it('sets header to SAMEORIGIN when called with uppercase "SAMEORIGIN"', function (done) {
      app.use(helmet.xframe('SAMEORIGIN')).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN', done);
    });

    it('sets header properly when called with lowercase "allow-from"', function (done) {
      app.use(helmet.xframe('allow-from', 'http://example.com')).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done);
    });

    it('sets header properly when called with uppercase "ALLOW-FROM"', function (done) {
      app.use(helmet.xframe('ALLOW-FROM', 'http://example.com')).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done);
    });

    it('sets header properly when called with lowercase "allowfrom"', function (done) {
      app.use(helmet.xframe('allowfrom', 'http://example.com')).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done);
    });

    it('sets header properly when called with uppercase "ALLOWFROM"', function (done) {
      app.use(helmet.xframe('ALLOWFROM', 'http://example.com')).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done);
    });

    it('works with String object set to "SAMEORIGIN" and doesn\'t change them', function (done) {
      /* jshint -W053 */
      var str = new String('SAMEORIGIN');
      /* jshint +W053 */
      app.use(helmet.xframe(str)).use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'SAMEORIGIN', done);
      assert.equal(str, 'SAMEORIGIN');
    });

    it('works with ALLOW-FROM with String objects and doesn\'t change them', function (done) {
      /* jshint -W053 */
      var directive = new String('ALLOW-FROM');
      var url = new String('http://example.com');
      /* jshint +W053 */
      app.use(helmet.xframe(directive, url));
      app.use(hello);
      request(app).get('/')
      .expect('X-Frame-Options', 'ALLOW-FROM http://example.com', done);
      assert.equal(directive, 'ALLOW-FROM');
      assert.equal(url, 'http://example.com');
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
      assert.throws(callWith(' deny '));
      assert.throws(callWith(' DENY '));
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
      assert.throws(callWith('ALLOW-FROM', 123));
      assert.throws(callWith('ALLOW-FROM', ['http://website.com', 'http//otherwebsite.com']));
    });

  });

  it('names its function and middleware', function () {
    assert.equal(helmet.xframe.name, 'xframe');
    assert.equal(helmet.xframe().name, 'xframe');
  });

});
