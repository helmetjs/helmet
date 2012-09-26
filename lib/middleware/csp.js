/*
## Content-Security-Policy 

options are a dictionary that can include
{ 
    policyName: examplePolicy, // use a specific policy
    reportOnly: true, // Enable report only header
}


*/
module.exports = function (options) {
    var policyName;
    var header = 'X-Content-Security-Policy';
    var header2 = 'X-WebKit-CSP';
    if (options) {
        policyName = options.policyName;
        if (options.reportOnly === true) {
            header = 'X-Content-Security-Policy-Report-Only';
            header2 = 'X-WebKit-CSP-Report-Only';
        }
    }

    return function (req, res, next)  {
        if (!policyName) {
            res.header(header, toString());
            res.header(header2, toString());
        } else {
            res.header(header, toString(policyName));
            res.header(header2, toString(policyName));
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
