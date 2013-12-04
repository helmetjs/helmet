/*
## Content-Security-Policy

options are a dictionary that can include
{
    policyName: examplePolicy, // use a specific policy
    reportOnly: true, // Enable report only header
}


*/
module.exports = function (options) {
    var policyName = 'defaultPolicy';
    var reportOnly = false;
    var enforcePolicy = false;
    if (options) {
        policyName = options.policyName || policyName;
        reportOnly = options.reportOnly || reportOnly;
        enforcePolicy = options.enforcePolicy || enforcePolicy;
    }

    return function (req, res, next)  {
        var browser = require('platform').parse(req.headers['user-agent']);
        var ver = parseFloat(browser.version);
        var entries = [];
        var newPolicyName = policyName;
        var sandboxSupported = false;
        // Determine correct format based on user agent.
        // Largely based on http://caniuse.com/contentsecuritypolicy.
        switch(browser.name) {
            case 'IE':
                if (ver >= 10 && newPolicyName in csp && 'sandbox' in csp[newPolicyName]) {
                    // IE allows for CSP headers only when sandboxing is activated.
                    // Activate sandboxing for a policy by adding elements like
                    // { sandbox: [] } or { sandbox: ['allow-forms', 'allow-scripts'] }.
                    entries[0] = 'X-Content-Security-Policy';
                }
                sandboxSupported = true;
                break;
            case 'Firefox':
                if (ver >= 4 && ver < 23) {
                    entries[0] = 'X-Content-Security-Policy';
                    // Some of the parameters need to be adapted for older FF browsers
                    // See https://blog.mozilla.org/security/2013/06/11/content-security-policy-1-0-lands-in-firefox/
                    // and https://bugzilla.mozilla.org/show_bug.cgi?id=634778
                    var policyNameFF = newPolicyName + '_oldFF';
                    var defaultDefined = false;
                    if (!(policyNameFF in csp)) {
                        var options = [], index;
                        for (var src in csp[newPolicyName]) {
                            if (csp[newPolicyName].hasOwnProperty(src)) {
                                var newSrc = src;
                                if (src == 'connect-src') {
                                    newSrc = 'xhr-src';
                                }
                                else if (src == 'default-src') {
                                    if (ver < 5) newSrc = 'allow';
                                    defaultDefined = true;
                                }
                                else if (src == 'sandbox') {
                                    newSrc = '';
                                }
                                if ((index = csp[newPolicyName][src].indexOf("'unsafe-inline'")) != -1) {
                                    if (src == 'script-src') options.push('inline-script');
                                    csp[newPolicyName][src].splice(index, 1);
                                }
                                if ((index = csp[newPolicyName][src].indexOf("'unsafe-eval'")) != -1) {
                                    if (src == 'script-src') options.push('eval-script');
                                    csp[newPolicyName][src].splice(index, 1);
                                }
                                if (newSrc) add(newSrc, csp[newPolicyName][src], policyNameFF);
                            }
                        }
                        if (options.length) add('options', options, policyNameFF);
                        if (!defaultDefined) add(ver < 5 ? 'allow' : 'default-src', ['*'], policyNameFF);
                    }
                    newPolicyName = policyNameFF;
                }
                else if (ver >= 23) {
                    entries[0] = 'Content-Security-Policy';
                }
                break;
            case 'Chrome':
                if (ver >= 14 && ver < 25) entries[0] = 'X-Webkit-CSP';
                else if (ver >= 25) entries[0] = 'Content-Security-Policy';
                if (ver >= 14) sandboxSupported = true; // Unsure whether 'sandbox' was supported all along or not
                break;
            case 'Safari':
                if (ver >= 5.1) entries[0] = 'X-Webkit-CSP';
                break;
            case 'Opera':
                if (ver >= 15) entries[0] = 'Content-Security-Policy';
                break;
            case 'Chrome Mobile':
                if (ver >= 14) entries[0] = 'Content-Security-Policy';
                break;
            default:
                if (enforcePolicy) {
                    entries.push('Content-Security-Policy', 'X-Webkit-CSP', 'X-Content-Security-Policy');
                    sandboxSupported = true
                }
        }
        // Add header entries (after removing sandbox directive if not supported by browser)
        for (var i = 0; i < entries.length; i++) {
            var content = toString(newPolicyName);
            if (!sandboxSupported) content = content.replace(/(?:;|^)(?:sandbox [ a-z-]*)($|;)/gi, '$1').replace(/^;/, '');
            res.header(reportOnly ? entries[i] + '-Report-Only' : entries[i], content);
        }
        next();
    };
};

var csp = {
    defaultPolicy: {
        "default-src": ["'self'"]
    }
};

/* Mass set one or more policies
Format should be something like
{policyName: {
    default-src: ["'self'"],
    image-src: ["static.andyet.net"]
    }
}

Will also eat the output of toJSON()
*/
module.exports.policy = function (policy) {
    if (policy) {
        csp = {};
        for (var policyName in policy) {
            if (policy.hasOwnProperty(policyName)) {
                for (var src in policy[policyName]) {
                    if (policy[policyName].hasOwnProperty(src)) {
                        add(src, policy[policyName][src], policyName);
                    }
                }
            }
        }
    }
};

// report-url helper function
module.exports.reportTo = function (url, policyName) {
    add('report-uri', url, policyName);
};

module.exports.reporter = function (app, username, password) {
    app.post('/csp-violation', function (req, res) {
        console.log(req.body);
        res.send("");
    });

    app.get('/csp-violation', express.basicAuth(username, password), function (req, res) {
        res.send("woot");
    });
};

var add = module.exports.add = function (sourceType, source, policyName) {
    if (!policyName) {
        policyName = "defaultPolicy";
    } else {
        if (!csp[policyName]) {
            csp[policyName] = {};
        }
    }

    if (!csp[policyName].hasOwnProperty(sourceType)) {
        csp[policyName][sourceType] = [];
    }
    if (typeof(source) == "string") {
        // Single Entry
        if (csp[policyName][sourceType].indexOf(source) === -1) {
            csp[policyName][sourceType].push(source);
        }
    } else if (Array.isArray(source)) {
        // Array?
        for (var i in source) {
            if (csp[policyName][sourceType].indexOf(source[i]) === -1) {
                csp[policyName][sourceType].push(source[i]);
            }
        }
    }
};

function toString(policyName) {
    if (!policyName) {
        policyName = 'defaultPolicy';
    }

    var policy = csp[policyName];
    var policyHeader = "";
    for (var src in policy) {
        var srcStr = "";
        if (policy.hasOwnProperty(src)) {
            srcStr += src;
            for (var i in policy[src]) {
                // srcStr += policy[src].join(' ')
                srcStr += " " + policy[src][i];
            }
            policyHeader += srcStr + ";";
        }
    }
    return policyHeader;
}


// Wonder what this function does. Feed the output of toJSON to policy() to re-inflate
module.exports.toJSON = function () {
    return JSON.stringify(csp);
};

module.exports.toJS = function () {
    return csp;
};
