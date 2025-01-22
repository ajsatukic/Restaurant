var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');

// Kreiranje Express aplikacije
const app = express();

// Middleware za sesije
app.use(
  session({
    secret: 'your-secret-key', // Promijenite u stvarni tajni ključ
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Postavite na `true` ako koristite HTTPS
  })
);

// Prosljeđivanje korisničkih podataka svim šablonima
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Rute
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const reservationsRoutes = require('./routes/reservations'); 
const adminRouter = require('./routes/admin'); 
const ordersRouter = require('./routes/orders');
const menuAdminRouter = require('./routes/menuAdmin'); // Učitajte fajl
const reservationsAdminRouter = require('./routes/reservationsAdmin');
const statsAdminRouter = require('./routes/statsAdmin');

// Postavljanje view engine-a
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware za logovanje, parsiranje i statičke fajlove
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin/reservations', reservationsAdminRouter);
app.use('/admin/stats', statsAdminRouter);

// Static files for CSS and images
app.use('/styles', express.static(path.join(__dirname, 'public/styles')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Korištenje ruta
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/menu', menuRoutes);
app.use('/cart', cartRoutes);
app.use('/reservations', reservationsRoutes); // Dodana ruta za rezervacije
app.use('/admin', adminRouter); // Use the admin router
app.use('/admin/orders', ordersRouter);
app.use('/admin/menu', menuAdminRouter); // Povežite rute

// Middleware za greške
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
