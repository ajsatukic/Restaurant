const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const router = express.Router();

// Prikaz login forme
router.get('/login', (req, res) => {
  res.render('login', {
    pageTitle: 'Login',
    formAction: '/auth/login',
    buttonText: 'Login',
    isRegister: false,
  });
});

// Prikaz registracione forme
router.get('/register', (req, res) => {
  res.render('login', {
    pageTitle: 'Register',
    formAction: '/auth/register',
    buttonText: 'Register',
    isRegister: true,
  });
});

// Proces prijave
// Proces prijave
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      // Spremaj korisničke podatke u sesiju
      req.session.user = { id: user.id, role: user.role, name: user.name };

      if (user.role === 'admin') {
        // Preusmjeri admina na admin dashboard
        res.redirect('/admin');
      } else {
        // Preusmjeri običnog korisnika na početnu stranicu
        res.redirect('/');
      }
    } else {
      // Neuspješan login
      res.status(401).render('login', {
        pageTitle: 'Login',
        formAction: '/auth/login',
        buttonText: 'Login',
        isRegister: false,
        error: 'Invalid email or password',
      });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).render('login', {
      pageTitle: 'Login',
      formAction: '/auth/login',
      buttonText: 'Login',
      isRegister: false,
      error: 'Internal server error',
    });
  }
});

// Proces registracije
router.post('/register', async (req, res) => {
    const { name, email, password, phone_number, role } = req.body; // Uključeno role iz forme
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await pool.query(
        'INSERT INTO users (name, email, password, role, phone_number) VALUES ($1, $2, $3, $4, $5)',
        [name, email, hashedPassword, role, phone_number]
      );
  
      res.redirect('/auth/login');
    } catch (err) {
      console.error('Error during registration:', err);
      res.status(500).render('login', {
        pageTitle: 'Register',
        formAction: '/auth/register',
        buttonText: 'Register',
        isRegister: true,
        error: 'Internal server error',
      });
    }
  });
  

// Odjava korisnika
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;
