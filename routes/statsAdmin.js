const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Konekcija s bazom
const { ensureAdmin } = require('../middlewares/auth'); // Middleware za admina

// Ruta za dohvaćanje statistike
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const totalOrdersQuery = 'SELECT COUNT(*) AS total FROM orders';
    const totalReservationsQuery = 'SELECT COUNT(*) AS total FROM reservations';
    const totalRevenueQuery = 'SELECT SUM(total_price) AS total FROM orders';

    // Dohvaćanje rezultata iz baze
    const totalOrdersResult = await db.query(totalOrdersQuery);
    const totalReservationsResult = await db.query(totalReservationsQuery);
    const totalRevenueResult = await db.query(totalRevenueQuery);

    // Renderovanje stranice sa statistikom
    res.render('statsAdmin', {
      stats: {
        totalOrders: totalOrdersResult.rows[0].total,
        totalReservations: totalReservationsResult.rows[0].total,
        totalRevenue: totalRevenueResult.rows[0].total || 0,
      },
      pageTitle: 'Statistika',
    });
  } catch (err) {
    console.error('Greška pri dohvaćanju statistike:', err);
    res.status(500).send('Greška na serveru');
  }
});

module.exports = router;
