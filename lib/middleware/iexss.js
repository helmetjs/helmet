/* IE 8+ X-XSS-Protection header
*/
module.exports = function () {
    return function (req, res, next)  {
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    };
};
