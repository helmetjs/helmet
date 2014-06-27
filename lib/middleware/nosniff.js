/* X-Content-Type-Options
 * The only defined value, "nosniff", prevents Internet Explorer from MIME-sniffing a response away from the declared content-type
*/
module.exports = function nosniff() {
    return function nosniff(req, res, next)  {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        next();
    };
};
