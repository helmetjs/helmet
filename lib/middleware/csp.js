/*
## Content-Security-Policy 

*/
module.exports = function (policyName) {
    return function (req, res, next)  {
        if (!policyName) {
            res.header('Content-Security-Policy', toString());
        } else {
            res.header('Content-Security-Policy', toString(policyName));
        }
        next();
    };
};

var csp = module.exports.csp = {
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
    } else {
        // Array?
        for (var i in source) {
            if (csp[policyName][sourceType].indexOf(source[i]) === -1) {
                csp[policyName][sourceType].push(source[i]);
            }
        }
    }
};

var toString = module.exports.toString = function (policyName) {
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
                srcStr += " " + policy[src][i];
            }
            policyHeader += srcStr + ";";
        }
    }
    return policyHeader;
};

module.exports.toJSON = function () {
    return JSON.stringify(csp);
};

