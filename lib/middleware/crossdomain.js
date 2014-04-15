var data = '<?xml version="1.0"?>' +
    '<!DOCTYPE cross-domain-policy SYSTEM "http://www.adobe.com/xml/dtds/cross-domain-policy.dtd">' +
    '<cross-domain-policy>' +
    '<site-control permitted-cross-domain-policies="none"/>' +
    '</cross-domain-policy>';

module.exports = function crossdomain() {

    return function crossdomain(req, res, next) {

        if ('/crossdomain.xml' == req.url) {
            res.writeHead(200, {
                'Content-Type': 'text/x-cross-domain-policy'
            });
            res.end(data);
        } else {
            next();
        }

    };

};
