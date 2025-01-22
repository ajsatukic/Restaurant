const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Ruta za dohvaćanje svih stavki menija i renderovanje menu.ejs fajla
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menuitems ORDER BY id ASC');
    const menuItems = result.rows;

    // Renderovanje menu.ejs fajla s podacima
    res.render('menu', { menuItems });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).send('Error fetching menu items');
  }
});

module.exports = router;
