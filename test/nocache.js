var helmet = require('../');

var assert = require('assert');
var connect = require('connect');
var request = require('supertest');

describe('nocache', function () {

    var app;
    beforeEach(function () {
        app = connect();
        app.use(helmet.nocache());
        app.use(function (req, res) {
            res.end('Hello world!');
        });
    });

    it('sets header properly', function (done) {
        request(app).get('/')
        .expect('Cache-Control', 'no-store, no-cache', done);
    });

    it('names its function and middleware', function () {
        assert.equal(helmet.nocache.name, 'nocache');
        assert.equal(helmet.nocache().name, 'nocache');
    });

});
