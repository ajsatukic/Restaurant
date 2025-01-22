function ensureLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/auth/login'); 
}

function ensureAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next(); // Nastavi ako je admin
  }
  console.warn('Access denied. User is not an admin.');
  res.status(403).redirect('/auth/login'); // Preusmjeri na login ako nije admin
}

module.exports = { ensureLoggedIn, ensureAdmin };
