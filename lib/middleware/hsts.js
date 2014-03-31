/*
HTTP Strict Transport Security (HSTS)

http://tools.ietf.org/html/rfc6797

*/

module.exports = function hsts(maxAge, includeSubdomains) {

    maxAge = maxAge || '15768000'; // approximately 6 months

    var header = 'max-age=' + maxAge;
    if (includeSubdomains) {
        header += '; includeSubdomains';
    }

    return function hsts(req, res, next)  {

        var isSecure = (req.secure) ||
            (req.headers['front-end-https'] == 'on') ||
            (req.headers['x-forwarded-proto'] == 'https');

        if (isSecure) {
            res.setHeader('Strict-Transport-Security', header);
        }

        next();
    };

};

