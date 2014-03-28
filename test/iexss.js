var helmet = require('../');

var connect = require('connect');
var request = require('supertest');

describe('iexss', function () {

    var IE_7 = 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)';
    var IE_8 = 'Mozilla/4.0 ( ; MSIE 8.0; Windows NT 6.0; Trident/4.0; GTB6.6; .NET CLR 3.5.30729)';
    var IE_9 = 'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US)';
    var FIREFOX_23 = 'Mozilla/5.0 (Windows NT 6.2; rv:22.0) Gecko/20130405 Firefox/23.0';

    var app;
    beforeEach(function () {
        app = connect();
        app.use(helmet.iexss());
        app.use(function (req, res) {
            res.end('Hello world!');
        });
    });

    it('sets header for Firefox 23', function (done) {
        request(app).get('/').set('User-Agent', FIREFOX_23)
        .expect('X-XSS-Protection', '1; mode=block', done);
    });

    it('sets header for IE 9', function (done) {
        request(app).get('/').set('User-Agent', IE_9)
        .expect('X-XSS-Protection', '1; mode=block', done);
    });

    it('sets header to 0 for IE 8', function (done) {
        request(app).get('/').set('User-Agent', IE_8)
        .expect('X-XSS-Protection', '0', done);
    });

    it('sets header to 0 for IE 7', function (done) {
        request(app).get('/').set('User-Agent', IE_7)
        .expect('X-XSS-Protection', '0', done);
    });

    it('allows you to set the header for old IE', function (done) {
        app = connect();
        app.use(helmet.iexss({ setOnOldIE: true }));
        app.use(function (req, res) {
            res.end('Hello world!');
        });
        request(app).get('/').set('User-Agent', IE_8)
        .expect('X-XSS-Protection', '1; mode=block', done);
    });

});
