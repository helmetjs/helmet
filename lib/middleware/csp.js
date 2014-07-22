// jshint quotmark: false

var _ = require('underscore');
var camelize = require('camelize');
var platform = require('platform');

var ALL_HEADERS = [
  'X-Content-Security-Policy',
  'Content-Security-Policy',
  'X-WebKit-CSP'
];

var DIRECTIVES = [
  'default-src',
  'script-src',
  'object-src',
  'img-src',
  'media-src',
  'frame-src',
  'font-src',
  'connect-src',
  'style-src',
  'report-uri',
  'sandbox'
];

var MUST_BE_QUOTED = [
  'none',
  'self',
  'unsafe-inline',
  'unsafe-eval'
];

module.exports = function csp(options) {

  options = _.clone(options) || { 'default-src': ["'self'"] };
  var reportOnly = options.reportOnly || false;
  var setAllHeaders = options.setAllHeaders || false;
  var safari5 = options.safari5 || false;

  DIRECTIVES.forEach(function (directive) {
    var cameledKey = camelize(directive);
    var cameledValue = options[cameledKey];
    if (cameledValue && (cameledKey !== directive)) {
      if (options[directive]) {
        throw new Error(directive + ' and ' + cameledKey + ' specified. Specify just one.');
      }
      options[directive] = cameledValue;
    }
  });

  _.each(options, function (value) {
    if (Array.isArray(value)) {
      MUST_BE_QUOTED.forEach(function (must) {
        if (value.indexOf(must) !== -1) {
          throw new Error(value + ' must be quoted');
        }
      });
    } else {
      MUST_BE_QUOTED.forEach(function (must) {
        if (value === must) {
          throw new Error(value + ' must be quoted');
        }
      });
    }
  });

  if (reportOnly && !options['report-uri']) {
    throw new Error('Please remove reportOnly or add a report-uri.');
  }

  return function csp(req, res, next) {

    var headers = [];
    var policy = {};

    var browser = platform.parse(req.headers['user-agent']);
    var version = parseFloat(browser.version);

    DIRECTIVES.forEach(function (directive) {

      var value = options[directive];
      if ((value !== null) && (value !== undefined)) {
        policy[directive] = value;
      }

      var shouldWrapInArray = (_(value).isString()) && (
        (directive !== 'sandbox') ||
        ((directive === 'sandbox') && (value !== true))
      );
      if (shouldWrapInArray) {
        policy[directive] = value.split(/\s/g);
      }

    });

    switch (browser.name) {

      case 'IE':
        if (version >= 10) {
        headers.push('X-Content-Security-Policy');
        if (!setAllHeaders) {
          if (policy.sandbox) {
            policy = { sandbox: policy.sandbox };
          } else {
            policy = {};
          }
        }
      }
      break;

      case 'Firefox':

        if (version >= 23) {

        headers.push('Content-Security-Policy');

      } else if ((version >= 4) && (version < 23)) {

        headers.push('X-Content-Security-Policy');

        policy['default-src'] = policy['default-src'] || ['*'];

        Object.keys(options).forEach(function (key) {

          var value = options[key];
          if (Array.isArray(value)) {
            // Clone the array so we don't later mutate `options` by mistake
            value = value.slice();
          }

          if (key === 'connect-src') {
            policy['xhr-src'] = value;
          } else if (key === 'default-src') {
            if (version < 5) {
              policy.allow = value;
            } else {
              policy['default-src'] = value;
            }
          } else if (key !== 'sandbox') {
            policy[key] = value;
          }

          if (Array.isArray(policy[key])) {

            var index;
            if ((index = policy[key].indexOf("'unsafe-inline'")) !== -1) {
              if (key === 'script-src') {
                policy[key][index] = "'inline-script'";
              } else {
                policy[key].splice(index, 1);
              }
            }
            if ((index = policy[key].indexOf("'unsafe-eval'")) !== -1) {
              if (key === 'script-src') {
                policy[key][index] = "'eval-script'";
              } else {
                policy[key].splice(index, 1);
              }
            }

          }

        });

      }

      break;

      case 'Chrome':
        if ((version >= 14) && (version < 25)) {
        headers.push('X-WebKit-CSP');
      } else if (version >= 25) {
        headers.push('Content-Security-Policy');
      }
      break;

      case 'Safari':
        if (version >= 7) {
        headers.push('Content-Security-Policy');
      } else if ((version >= 6) || ((version >= 5.1) && safari5)) {
        headers.push('X-WebKit-CSP');
      }
      break;

      case 'Opera':
        if (version >= 15) {
        headers.push('Content-Security-Policy');
      }
      break;

      case 'Chrome Mobile':
        if (version >= 14) {
        headers.push('Content-Security-Policy');
      }
      break;

      default:
        setAllHeaders = true;

    }

    var policyString = _.map(policy, function (value, key) {
      if ((key === 'sandbox') && (value === true)) {
        return 'sandbox';
      } else if (Array.isArray(value)) {
        return key + ' ' + value.join(' ');
      } else {
        return key + ' ' + value;
      }
    }).join(';');

    if (setAllHeaders) {
      headers = ALL_HEADERS;
    }

    if (policyString) {
      headers.forEach(function (header) {
        var headerName = header;
        if (reportOnly) {
          headerName += '-Report-Only';
        }
        res.setHeader(headerName, policyString);
      });
    }

    next();

  };

};
