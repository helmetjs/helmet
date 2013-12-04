var helmet = require('../');

var connect = require('connect');
var request = require('supertest');

describe('contentTypeOptions', function () {

    var app;
    beforeEach(function () {
        app = connect();
        app.use(helmet.contentTypeOptions());
        app.use(function (req, res) {
            res.end('Hello world!');
        });
    });

    it('sets header properly', function (done) {
        request(app).get('/')
        .expect('X-Content-Type-Options', 'nosniff', done);
    });

});
