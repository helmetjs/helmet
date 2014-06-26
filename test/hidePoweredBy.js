var helmet = require('../');

var connect = require('connect');
var request = require('supertest');
var assert = require('assert');

describe('hidePoweredBy', function () {

    function test(name, options) {
        it(name, function (done) {
            var app = connect();
            app.use(function (req, res, next) {
                res.setHeader('X-Powered-By', 'Computers');
                next();
            });
            app.use(options.middleware);
            app.use(function (req, res) {
                res.end('Hello world!');
            });
            request(app).get('/')
            .end(function (err, res) {
                if (err) return done(err);
                assert.equal(res.header['x-powered-by'], options.shouldBe);
                done();
            });
        });
    }

    test('removes the X-Powered-By header', {
        middleware: helmet.hidePoweredBy(),
        shouldBe: undefined
    });

    test('allows you to explicitly set the header', {
        middleware: helmet.hidePoweredBy({ setTo: 'steampowered' }),
        shouldBe: 'steampowered'
    });

});
