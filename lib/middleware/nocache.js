/* Cache-Control
*/
module.exports = function nocache() {
    return function nocache(req, res, next)  {
        res.setHeader('Cache-Control', 'no-store, no-cache');
        next();
    };
};
