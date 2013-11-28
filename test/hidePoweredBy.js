var helmet = require('../');

var connect = require('connect');
var request = require('supertest');
var assert = require('assert');

describe('hidePoweredBy', function () {

    var app;
    beforeEach(function () {
        app = connect();
        app.use(function (req, res, next) {
            res.setHeader('X-Powered-By', 'Computers');
            next();
        });
        app.use(helmet.hidePoweredBy());
        app.use(function (req, res) {
            res.end('Hello world!');
        });
    });

    it('removes the X-Powered-By header', function (done) {
        request(app).get('/')
        .end(function (err, res) {
            if (err) return done(err);
            assert.equal(res.header['x-powered-by'], undefined);
            done();
        });
    });

});
