const session = require('express-session');

function isAuth(req, res, next) {
    if (!req.session.admin) {
        return res.status(401).redirect('/admin')
    }
    next()
}

module.exports = {isAuth}