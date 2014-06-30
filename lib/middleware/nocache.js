module.exports = function nocache() {
    return function nocache(req, res, next)  {
        res.setHeader('Cache-Control', 'no-store, no-cache');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
    };
};
