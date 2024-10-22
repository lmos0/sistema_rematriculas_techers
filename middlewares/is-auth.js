function isAuth(req, res, next) {
  if (!req.session.isLoggedIn) {
    return res.redirect('/');
  }
  next();
}

module.exports = {isAuth}