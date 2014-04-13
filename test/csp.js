// jshint quotmark: false

var helmet = require('../');

var _ = require('underscore');
var connect = require('connect');
var request = require('supertest');
var assert = require('assert');

function helloWorld(req, res) {
    res.end('Hello world!');
}

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

    var AGENTS = {
        'Firefox 22': {
            string: 'Mozilla/5.0 (Windows NT 6.2; rv:22.0) Gecko/20130405 Firefox/22.0',
            special: true
        },
        'Firefox 23': {
            string: 'Mozilla/5.0 (Windows NT 6.2; rv:22.0) Gecko/20130405 Firefox/23.0',
            header: 'Content-Security-Policy'
        },
        'Chrome 24': {
            string: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.60 Safari/537.17',
            header: 'X-WebKit-CSP'
        },
        'Chrome 27': {
            string: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36',
            header: 'Content-Security-Policy'
        },
        'Opera 15': {
            string: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.117 Safari/537.36 OPR/15.0.1387.64',
            header: 'Content-Security-Policy'
        },
        'Safari 5.1': {
            string: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/534.55.3 (KHTML, like Gecko) Version/5.1.3 Safari/534.53.10',
            special: true
        },
        'Safari 6': {
            string: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 1084) AppleWebKit/536.30.1 (KHTML like Gecko) Version/6.0.5 Safari/536.30.1',
            header: 'X-WebKit-CSP'
        },
        'Safari 7': {
            string: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.74.9 (KHTML, like Gecko) Version/7.0.2 Safari/537.74.9',
            header: 'Content-Security-Policy'
        }
    };

    function use (policy) {
        var result = connect();
        result.use(helmet.csp(policy));
        result.use(helloWorld);
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
        request(app).get('/').set('User-Agent', AGENTS['Firefox 23'].string)
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
            'default-src': ["'self'"],
            'report-uri': '/reporter'
        });
        request(app).get('/').set('User-Agent', AGENTS['Firefox 23'].string)
        .expect('X-Content-Security-Policy-Report-Only', /default-src 'self'/)
        .expect('Content-Security-Policy-Report-Only', /default-src 'self'/)
        .expect('X-WebKit-CSP-Report-Only', /default-src 'self'/)
        .end(done);
    });

    it('throws an error when directives need quotes', function () {
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

    it('throws an error reportOnly is true and there is no report-uri', function () {
        assert.throws(function() {
            helmet.csp({ reportOnly: true });
        }, Error);
    });

    _.each(AGENTS, function(agent) {

        if (agent.special) {
            return;
        }

        it('sets the header properly for ' + agent.name, function (done) {
            var app = use(POLICY);
            var header = agent.header;
            request(app).get('/').set('User-Agent', agent.string)
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

    it('sets the header properly for Firefox 22', function (done) {
        var policy = _.extend({
            safari5: true
        }, POLICY);
        var app = use(policy);
        var header = 'X-Content-Security-Policy';
        request(app).get('/').set('User-Agent', AGENTS['Firefox 22'].string)
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

    it("doesn't set the property for Safari 5.1 by default", function (done) {
        var app = use(POLICY);
        request(app).get('/').set('User-Agent', AGENTS['Safari 5.1'].string)
        .end(function(err, res) {
            if (err) {
                return done(err);
            }
            assert(res.header['X-WebKit-CSP'] === undefined);
            assert(res.header['Content-Security-Policy'] === undefined);
            assert(res.header['X-Content-Security-Policy'] === undefined);
            done();
        });
    });

    it('sets the header for Safari 5.1 if you force it', function (done) {
        var app = use({
            safari5: true,
            'default-src': 'a.com'
        });
        request(app).get('/').set('User-Agent', AGENTS['Safari 5.1'].string)
        .expect('X-WebKit-CSP', 'default-src a.com', done);
    });

});
