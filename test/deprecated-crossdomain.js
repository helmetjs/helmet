var proxyquire = require('proxyquire');
var assert = require('assert');
var sinon = require('sinon');

describe('crossdomain deprecation', function() {

  beforeEach(function() {
    var scope = this;

    this.realModuleSpy = sinon.spy();
    this.realModuleSpy['@global'] = true;
    this.depdSpy = sinon.spy();

    function fakeDepd(moduleName) {
      scope.depdModuleName = moduleName;
      return scope.depdSpy;
    }
    fakeDepd['@global'] = true;

    this.helmet = proxyquire('..', {
      'helmet-crossdomain': this.realModuleSpy,
      depd: fakeDepd
    });
  });

  it('continues to alias "crossdomain" and "crossDomain"', function() {
    assert.equal(this.helmet.crossdomain, this.helmet.crossDomain);
  });

  it('omits the middleware by default', function() {
    sinon.spy(this.helmet, 'crossdomain');
    this.helmet();
    assert.equal(this.helmet.crossdomain.callCount, 0);
    this.helmet.crossdomain.restore();
  });

  it('calls through to the real middleware', function() {
    assert(!this.realModuleSpy.called);
    this.helmet.crossdomain();
    assert(this.realModuleSpy.calledOnce);
  });

  it('creates a depd instance with the name "helmet"', function() {
    assert.equal(this.depdModuleName, 'helmet');
  });

  it('shows a depd deprecation warning', function() {
    this.helmet.crossdomain();
    assert(this.depdSpy.calledOnce);
  });

});
