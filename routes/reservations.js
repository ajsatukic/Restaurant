const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { ensureLoggedIn } = require('../middlewares/auth');

// Dohvat svih stolova i rezervacija za prijavljenog korisnika
router.get('/', ensureLoggedIn, async (req, res) => {
  const user_id = req.session.user.id;

  try {
    const tables = await pool.query('SELECT * FROM tables');
    const userReservations = await pool.query(
      'SELECT * FROM reservations WHERE user_id = $1 AND reservation_date >= NOW()',
      [user_id]
    );

    // Mapiranje rezervacija po broju stola
    const reservedTables = new Set(
      userReservations.rows.map((reservation) => reservation.table_number)
    );

    res.render('reservations', {
      pageTitle: 'Moje Rezervacije',
      tables: tables.rows,
      reservations: userReservations.rows,
      reservedTables, // Set rezervisanih stolova
      user: req.session.user
    });
  } catch (err) {
    console.error('Error fetching user reservations:', err);
    res.status(500).render('error', { error: 'Failed to load user reservations' });
  }
});

// Dodavanje nove rezervacije
router.post('/add', ensureLoggedIn, async (req, res) => {
  const { table_number, reservation_date, reservation_time } = req.body;
  const user_id = req.session.user.id;

  try {
    // Provjera zauzetosti stola
    const existingReservation = await pool.query(
      `SELECT * FROM reservations 
       WHERE table_number = $1 AND reservation_date = $2 AND reservation_time = $3`,
      [table_number, reservation_date, reservation_time]
    );

    if (existingReservation.rows.length > 0) {
      return res.status(400).json({ error: 'Table is already reserved for the selected time' });
    }

    // Dodavanje nove rezervacije
    await pool.query(
      `INSERT INTO reservations (user_id, table_number, reservation_date, reservation_time, status) 
       VALUES ($1, $2, $3, $4, 'reserved')`,
      [user_id, table_number, reservation_date, reservation_time]
    );

    res.status(201).json({ message: 'Table successfully reserved!' });
  } catch (err) {
    console.error('Error adding reservation:', err);
    res.status(500).json({ error: 'Failed to add reservation' });
  }
});

// Dohvat svih stolova sa statusima (za administratore ili pregled dostupnih stolova)
router.get('/status', ensureLoggedIn, async (req, res) => {
  try {
    const tables = await pool.query('SELECT * FROM tables');
    const reservations = await pool.query(
      'SELECT table_number, reservation_date, reservation_time FROM reservations WHERE reservation_date >= NOW()'
    );

    const reservedTables = new Set(
      reservations.rows.map((reservation) => reservation.table_number)
    );

    res.render('reservations', {
      pageTitle: 'Rezervacije Stolova',
      tables: tables.rows,
      reservedTables,
      user: req.session.user
    });
  } catch (err) {
    console.error('Error fetching tables and reservations:', err);
    res.status(500).render('error', { error: 'Failed to load reservations' });
  }
});

module.exports = router;
