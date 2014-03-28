// jshint quotmark: false

var helmet = require('../');

var connect = require('connect');
var request = require('supertest');
var assert = require('assert');

describe('csp middleware', function () {

    var POLICY = {
        'default-src': ["'self'", 'default.com'],
        'script-src': ['scripts.com'],
        'style-src': ['style.com'],
        'img-src': ['img.com'],
        'connect-src': ['connect.com'],
        'font-src': ['font.com'],
        'object-src': ['object.com'],
        'media-src': ['media.com'],
        'frame-src': ['frame.com'],
        'sandbox': ['allow-forms', 'allow-scripts'],
        'report-uri': ['/report-violation']
    };

    var FIREFOX_22 = 'Mozilla/5.0 (Windows NT 6.2; rv:22.0) Gecko/20130405 Firefox/22.0';
    FIREFOX_22.name = 'Firefox 22';

    var FIREFOX_23 = 'Mozilla/5.0 (Windows NT 6.2; rv:22.0) Gecko/20130405 Firefox/23.0';
    FIREFOX_23.name = 'Firefox 23';

    var CHROME_25 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 1092) AppleWebKit/537.22 (KHTML like Gecko) Chrome/25.0.1364.97 Safari/537.22';
    CHROME_25.name = 'Chrome 25';

    var OPERA_20 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36 OPR/20.0.1387.64';
    OPERA_20.name = 'Opera 15';

    function use (policy) {
        var result = connect();
        result.use(helmet.csp(policy));
        result.use(function (req, res) {
            res.end('Hello world!');
        });
        return result;
    }

    it('sets headers by string', function (done) {
        var app = use({ 'default-src': 'a.com b.biz' });
        request(app).get('/')
        .expect('Content-Security-Policy', /default-src a.com b.biz/, done);
    });

    it('sets all the headers if you tell it to', function (done) {
        var app = use({
            setAllHeaders: true,
            'default-src': ["'self'", 'domain.com']
        });
        request(app).get('/').set('User-Agent', FIREFOX_23)
        .expect('X-Content-Security-Policy', /default-src 'self' domain.com/)
        .expect('Content-Security-Policy', /default-src 'self' domain.com/)
        .expect('X-WebKit-CSP', /default-src 'self' domain.com/)
        .end(done);
    });

    it('sets all the headers if you provide an unknown user-agent', function (done) {
        var app = use({ 'default-src': ["'self'", 'domain.com'] });
        request(app).get('/').set('User-Agent', 'Burrito Browser')
        .expect('X-Content-Security-Policy', /default-src 'self' domain.com/)
        .expect('Content-Security-Policy', /default-src 'self' domain.com/)
        .expect('X-WebKit-CSP', /default-src 'self' domain.com/)
        .end(done);
    });

    it('sets the report-only headers', function (done) {
        var app = use({
            reportOnly: true,
            setAllHeaders: true,
            'default-src': ["'self'"]
        });
        request(app).get('/').set('User-Agent', FIREFOX_23)
        .expect('X-Content-Security-Policy-Report-Only', /default-src 'self'/)
        .expect('Content-Security-Policy-Report-Only', /default-src 'self'/)
        .expect('X-WebKit-CSP-Report-Only', /default-src 'self'/)
        .end(done);
    });

    it('throws an error with unquoted input', function () {
        assert.throws(function() {
            helmet.csp({ 'default-src': ['none'] });
        }, Error);
        assert.throws(function() {
            helmet.csp({ 'default-src': ['self'] });
        }, Error);
        assert.throws(function() {
            helmet.csp({ 'script-src': ['unsafe-inline'] });
        }, Error);
        assert.throws(function() {
            helmet.csp({ 'script-src': ['unsafe-eval'] });
        }, Error);
        assert.throws(function() {
            helmet.csp({ 'default-src': 'self' });
        }, Error);
    });

    it('sets the header properly for Firefox 22', function (done) {
        var app = use(POLICY);
        var header = 'X-Content-Security-Policy';
        request(app).get('/').set('User-Agent', FIREFOX_22)
        .expect(header, /default-src 'self' default.com/)
        .expect(header, /script-src scripts.com/)
        .expect(header, /img-src img.com/)
        .expect(header, /xhr-src connect.com/)
        .expect(header, /font-src font.com/)
        .expect(header, /object-src object.com/)
        .expect(header, /media-src media.com/)
        .expect(header, /frame-src frame.com/)
        .expect(header, /sandbox allow-forms allow-scripts/)
        .expect(header, /report-uri \/report-violation/)
        .end(done);
    });

    [
        FIREFOX_23,
        CHROME_25,
        OPERA_20
    ].forEach(function (useragent) {

        it('sets the header properly for ' + useragent.name, function (done) {
            var app = use(POLICY);
            var header = 'Content-Security-Policy';
            request(app).get('/').set('User-Agent', useragent)
            .expect(header, /default-src 'self' default.com/)
            .expect(header, /script-src scripts.com/)
            .expect(header, /img-src img.com/)
            .expect(header, /connect-src connect.com/)
            .expect(header, /font-src font.com/)
            .expect(header, /object-src object.com/)
            .expect(header, /media-src media.com/)
            .expect(header, /frame-src frame.com/)
            .expect(header, /sandbox allow-forms allow-scripts/)
            .expect(header, /report-uri \/report-violation/)
            .end(done);
        });

    });

});

describe('csp reporter', function () {

    it('adds cspReport to the request object', function (done) {

        var report = JSON.stringify({
            'csp-report': {
                'document-uri': 'http://example.org/page.html',
                'referrer': 'http://evil.example.com/',
                'blocked-uri': 'http://evil.example.com/evil.js',
                'violated-directive': "script-src 'self' https://apis.google.com",
                'original-policy': "script-src 'self' https://apis.google.com; report-uri http://example.org/my_amazing_csp_report_parser"
            }
        });

        var app = connect();
        app.use(helmet.csp.reporter('/csp-report', function (req, res) {
            var report = req.cspReport;
            assert(report);
            assert(report['document-uri']);
            assert(report['referrer']);
            assert(report['blocked-uri']);
            assert(report['violated-directive']);
            assert(report['original-policy']);
        }));
        app.use(function (req, res) {
            res.end('Hello world!');
        });

        request(app).post('/csp-report')
        .set('Content-Type', 'application/json; charset=UTF-8')
        .send(report)
        .expect(204, done);

    });

});
