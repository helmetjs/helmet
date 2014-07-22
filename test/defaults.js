var helmet = require('../');

var assert = require('assert');
var sinon = require('sinon');

var defaultMiddleware = [
  'crossdomain',
  'hidePoweredBy',
  'hsts',
  'ienoopen',
  'nocache',
  'nosniff',
  'xframe',
  'xssFilter'
];
var allMiddleware = defaultMiddleware.concat(['csp']);

describe('helmet defaults', function () {

  beforeEach(function () {
    allMiddleware.forEach(function (name) {
      sinon.spy(helmet, name);
    });
  });

  afterEach(function () {
    allMiddleware.forEach(function (name) {
      helmet[name].restore();
    });
  });

  it('calls all middleware but CSP by default', function () {
    helmet();
    defaultMiddleware.forEach(function (name) {
      var middleware = helmet[name];
      assert(middleware.calledOnce);
    });
    assert(!helmet.csp.called);
  });

  it('lets you override some of the defaults', function () {
    var options = { hsts: false, xframe: false };
    helmet(options);
    allMiddleware.forEach(function (name) {
      var middleware = helmet[name];
      if (options[name] === false) {
        assert(!middleware.called);
      } else {
        assert(middleware.calledOnce);
      }
    });
  });

  it('lets you override all of the defaults', function () {
    var options = {};
    allMiddleware.forEach(function (name) {
      options[name] = false;
    });
    helmet(options);
    allMiddleware.forEach(function (name) {
      var middleware = helmet[name];
      assert(!middleware.called);
    });
  });

});
