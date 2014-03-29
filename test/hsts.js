var helmet = require('../');

var connect = require('connect');
var request = require('supertest');

describe('hsts', function () {

    var app;
    beforeEach(function () {
        app = connect();
    });

    it('sets header properly with no args', function (done) {
        app.use(helmet.hsts());
        app.use(function (req, res) {
            res.end('Hello world!');
        });
        request(app).get('/')
        .set('x-forwarded-proto', 'https')
        .expect('Strict-Transport-Security', 'max-age=15768000', done);
    });

    it('sets header properly with args', function (done) {
        app.use(helmet.hsts('1234', true));
        app.use(function (req, res) {
            res.end('Hello world!');
        });
        request(app).get('/')
        .set('x-forwarded-proto', 'https')
        .expect('Strict-Transport-Security', 'max-age=1234; includeSubdomains', done);
    });

});
