/*
HTTP Strict Transport Security (HSTS)

http://tools.ietf.org/html/draft-ietf-websec-strict-transport-sec-04

*/

module.exports = function (maxAge, includeSubdomains) {
    if (!maxAge) maxAge = '15768000'; // Approximately 6 months
    var header = "maxAge=" + maxAge;

    if (includeSubdomains) header += '; includeSubdomains';
    
    return function (req, res, next)  {
        if (req.secure || req.headers['x-forwarded-proto'] == 'https') {
            res.header('Strict-Transport-Security', header);
        }
        next();
    };
};

