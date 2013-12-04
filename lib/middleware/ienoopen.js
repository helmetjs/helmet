/* IE8+ X-Download-Options header
 *
 * When sending attachments, don't allow people to open them in the context of
 * your site.
 *
 * For more, see this MSDN blog post:
 * http://blogs.msdn.com/b/ie/archive/2008/07/02/ie8-security-part-v-comprehensive-protection.aspx
*/

module.exports = function () {
    return function (req, res, next)  {
        res.setHeader('X-Download-Options', 'noopen');
        next();
    };
};
