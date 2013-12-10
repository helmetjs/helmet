/*
HTTP Strict Transport Security (HSTS)

http://tools.ietf.org/html/rfc6797

*/

module.exports = function (maxAge, includeSubdomains) {
    if (!maxAge) maxAge = '15768000'; // Approximately 6 months
    var header = "max-age=" + maxAge;

    if (includeSubdomains) header += '; includeSubdomains';
    
    return function (req, res, next)  {
        if (req.secure || req.headers['x-forwarded-proto'] == 'https') {
            res.setHeader('Strict-Transport-Security', header);
        }
        next();
    };
};

