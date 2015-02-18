var helmet = require('..');
var config = require('../config.json');

var assert = require('assert');
var sinon = require('sinon');

describe('helmet', function() {

  var packagesByKey = {};
  var moduleNames = Object.keys(config.middlewares);
  var packages = [];
  moduleNames.forEach(function(moduleName) {
    var pkg = require(moduleName);
    packages.push(pkg);
    packagesByKey[moduleName] = pkg;
  });

  it('maintains module aliases', function() {
    moduleNames.forEach(function(moduleName) {
      var pkg = packagesByKey[moduleName];
      var aliases = config.middlewares[moduleName];
      aliases.forEach(function(alias) {
        assert.equal(helmet[alias], pkg);
      });
    });
  });

  it('chains all default middleware', function() {
    moduleNames.forEach(function(moduleName) {
      sinon.spy(helmet, moduleName);
    });
    helmet();
    moduleNames.forEach(function(moduleName) {
      var pkg = helmet[moduleName];
      var isDefault = config.defaultMiddleware.indexOf(moduleName) !== -1;
      if (isDefault) {
        assert(pkg.calledOnce, moduleName + ' is default but is not called');
      } else {
        assert(!pkg.called, moduleName + ' is called but is not default');
      }
      pkg.restore();
    });
  });

});
