var helmet = require('../');

var connect = require('connect');
var request = require('supertest');

describe('crossdomain', function () {

    function helloWorld(req, res) {
        res.end('Hello world!');
    }

    var app;
    beforeEach(function () {
        app = connect();
        app.use(helmet.crossdomain());
        app.use(helloWorld);
    });

    function expectPolicy(uri, done) {
        request(app).get(uri)
        .expect('Content-Type', /text\/x-cross-domain-policy/)
        .expect(/^<\?xml version="1.0"\?>/)
        .expect(/<!DOCTYPE cross-domain-policy SYSTEM "http:\/\/www.adobe.com\/xml\/dtds\/cross-domain-policy\.dtd">/)
        .expect(/<cross-domain-policy>.+<\/cross-domain-policy>$/)
        .expect(/<site-control permitted-cross-domain-policies="none"\/>/)
        .expect(200, done);
    }

    function test(uri) {
        it('responds with proper XML visiting ' + uri, function (done) {
            expectPolicy(uri, done);
        });
    }

    it('preserves normal responses', function (done) {
        request(app).get('/').expect('Hello world!', done);
    });

    test('/crossdomain.xml');
    test('/crossdomain.XML');
    test('/CrossDomain.xml');
    test('/CROSSDOMAIN.xml');
    test('/CROSSDOMAIN.XML');

    it('can be forced to be case-sensitive in the middleware', function (done) {

        var testsRemaining = 5;
        function finished(err) {
            if (err) {
                done(err);
                return;
            }
            testsRemaining -= 1;
            if (testsRemaining === 0) {
                done();
            }
        }

        app = connect();
        app.use(helmet.crossdomain({ caseSensitive: true }));
        app.use(helloWorld);

        expectPolicy('/crossdomain.xml', finished);
        request(app).get('/crossdomain.XML').expect('Hello world!', finished);
        request(app).get('/CrossDomain.xml').expect('Hello world!', finished);
        request(app).get('/CROSSDOMAIN.xml').expect('Hello world!', finished);
        request(app).get('/CROSSDOMAIN.XML').expect('Hello world!', finished);

    });

});
