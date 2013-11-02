/* Remove the X-Powered-By header if present
*/
module.exports = function () {
    return function (req, res, next) {
        res.removeHeader('X-Powered-By');
        next();
    };
};
