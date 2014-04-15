var helmet = require('../');

var connect = require('connect');
var request = require('supertest');

describe('crossdomain', function () {

    var app;
    beforeEach(function () {
        app = connect();
        app.use(helmet.crossdomain());
        app.use(function (req, res) {
            res.end('Hello world!');
        });
    });

    it('preserves normal responses', function (done) {
        request(app).get('/')
        .expect('Hello world!', done);
    });

    it('responds with proper XML', function (done) {
        request(app).get('/crossdomain.xml')
        .expect('Content-Type', /text\/x-cross-domain-policy/)
        .expect(/^<\?xml version="1.0"\?>/)
        .expect(/<!DOCTYPE cross-domain-policy SYSTEM "http:\/\/www.adobe.com\/xml\/dtds\/cross-domain-policy\.dtd">/)
        .expect(/<cross-domain-policy>.+<\/cross-domain-policy>$/)
        .expect(/<site-control permitted-cross-domain-policies="none"\/>/)
        .expect(200, done);
    });

});
