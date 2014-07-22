var helmet = require('../');

var assert = require('assert');
var connect = require('connect');
var request = require('supertest');

describe('nosniff', function () {

  var app;
  beforeEach(function () {
    app = connect();
    app.use(helmet.nosniff());
    app.use(function (req, res) {
      res.end('Hello world!');
    });
  });

  it('sets header properly', function (done) {
    request(app).get('/')
    .expect('X-Content-Type-Options', 'nosniff', done);
  });

  it('names its function and middleware', function () {
    assert.equal(helmet.nosniff.name, 'nosniff');
    assert.equal(helmet.nosniff().name, 'nosniff');
  });

});
