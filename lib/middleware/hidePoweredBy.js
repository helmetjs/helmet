/* Remove the X-Powered-By header if present
*/
module.exports = function (options) {

    options = (options || {});
    var setTo = options.setTo;

    if (setTo) {
        return function (req, res, next) {
            res.setHeader('X-Powered-By', setTo);
            next();
        };
    } else {
        return function (req, res, next) {
            res.removeHeader('X-Powered-By');
            next();
        };
    }

};
