/* Cache-Control
*/
module.exports = function () {
    return function (req, res, next)  {
        res.setHeader('Cache-Control', 'no-store, no-cache');
        next();
    };
};
