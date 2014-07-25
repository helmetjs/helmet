var helmet = require('../');

var assert = require('assert');
var connect = require('connect');
var request = require('supertest');

function helloWorld(req, res) {
  res.end('Hello world!');
}

describe('nocache', function () {

  var app;
  beforeEach(function () {
    app = connect();
    app.use(helmet.nocache());
    app.use(helloWorld);
  });

  it('sets headers properly', function (done) {
    request(app).get('/')
    .expect('Cache-Control', 'no-store, no-cache')
    .expect('Pragma', 'no-cache')
    .expect('Expires', '0')
    .end(done);
  });

  it('can be told to squash etags', function (done) {
    app = connect();
    app.use(function(req, res, next) {
      res.setHeader('ETag', 'abc123');
      next();
    });
    app.use(helmet.nocache({ noEtag: true }));
    app.use(helloWorld);
    request(app).get('/')
    .expect('Cache-Control', 'no-store, no-cache')
    .expect('Pragma', 'no-cache')
    .expect('Expires', '0')
    .end(function (err, res) {
      if (err) {
        done(err);
        return;
      }
      assert.equal(res.header.etag, undefined);
      done();
    });
  });

  it('names its function and middleware', function () {
    assert.equal(helmet.nocache.name, 'nocache');
    assert.equal(helmet.nocache().name, 'nocache');
  });

});
