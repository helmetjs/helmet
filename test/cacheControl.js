var helmet = require('../');

var connect = require('connect');
var request = require('supertest');

describe('cacheControl', function () {

    var app;
    beforeEach(function () {
        app = connect();
        app.use(helmet.cacheControl());
        app.use(function (req, res) {
            res.end('Hello world!');
        });
    });

    it('sets header properly', function (done) {
        request(app).get('/')
        .expect('Cache-Control', 'no-store, no-cache', done);
    });

});
