const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Povezivanje s bazom podataka
const { ensureAdmin } = require('../middlewares/auth'); // Middleware za provjeru admina

// Ruta za dohvaćanje svih rezervacija
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id, 
        u.name AS user_name, 
        r.table_number, 
        r.reservation_date, 
        r.reservation_time, 
        r.status
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.reservation_date, r.reservation_time
    `;
    const result = await db.query(query);

    res.render('reservationsAdmin', {
      reservations: result.rows,
      pageTitle: 'Upravljanje rezervacijama',
    });
  } catch (err) {
    console.error('Greška pri dohvaćanju rezervacija:', err);
    res.status(500).send('Greška na serveru');
  }
});

module.exports = router;
