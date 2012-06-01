/* Cache-Control
*/
module.exports = function () {
    return function (req, res, next)  {
        res.header('Cache-Control', 'no-store, no-cache');
        next();
    };
};
