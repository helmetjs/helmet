var helmet = require('../');

var connect = require('connect');
var request = require('supertest');

describe('iexss', function () {

    var app;
    beforeEach(function () {
        app = connect();
        app.use(helmet.iexss());
        app.use(function (req, res) {
            res.end('Hello world!');
        });
    });

    it('sets header properly', function (done) {
        request(app).get('/')
        .expect('X-XSS-Protection', '1; mode=block', done);
    });

});
