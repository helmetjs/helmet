var helmet = require('../');

var connect = require('connect');
var request = require('supertest');
var assert = require('assert');

function helloWorld (req, res) {
  res.end('Hello world!');
}

describe('hidePoweredBy', function () {

  function test(name, options) {
    it(name, function (done) {
      var app = connect();
      app.use(function (req, res, next) {
        res.setHeader('X-Powered-By', 'Computers');
        next();
      });
      app.use(options.middleware);
      app.use(helloWorld);
      request(app).get('/')
      .end(function (err, res) {
        if (err) {
          done(err);
          return;
        }
        assert.equal(res.header['x-powered-by'], options.shouldBe);
        done();
      });
    });
  }

  it('works even if no header is set', function (done) {
    var app = connect();
    app.use(helmet.hidePoweredBy());
    app.use(helloWorld);
    request(app).get('/')
    .end(function (err, res) {
      if (err) {
        done(err);
        return;
      }
      assert.equal(res.header['x-powered-by'], undefined);
      done();
    });
  });

  test('removes the X-Powered-By header', {
    middleware: helmet.hidePoweredBy(),
    shouldBe: undefined
  });

  test('allows you to explicitly set the header', {
    middleware: helmet.hidePoweredBy({ setTo: 'steampowered' }),
    shouldBe: 'steampowered'
  });

  it('names its function and middleware', function () {
    assert.equal(helmet.hidePoweredBy.name, 'hidePoweredBy');
    assert.equal(helmet.hidePoweredBy().name, 'hidePoweredBy');
  });

});
