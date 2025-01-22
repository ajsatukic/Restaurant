const express = require('express');
const { ensureLoggedIn } = require('../middlewares/auth');
const pool = require('../config/db');
const router = express.Router();

// Dodavanje u korpu
router.post('/add', ensureLoggedIn, async (req, res) => {
  const { menuitem_id, quantity } = req.body;
  const user_id = req.session.user?.id;

  if (!menuitem_id || !quantity || !user_id) {
    console.error('Missing required fields:', { menuitem_id, quantity, user_id });
    return res.status(400).json({ error: 'Menu Item ID, quantity, and user ID are required.' });
  }

  try {
    // Provjerite da li stavka već postoji u korpi za ovog korisnika
    const existingItem = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND menuitem_id = $2',
      [user_id, menuitem_id]
    );

    if (existingItem.rows.length > 0) {
      // Ako postoji, ažurirajte količinu
      await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND menuitem_id = $3',
        [quantity, user_id, menuitem_id]
      );
    } else {
      // Ako ne postoji, dodajte novu stavku
      await pool.query(
        'INSERT INTO cart (user_id, menuitem_id, quantity) VALUES ($1, $2, $3)',
        [user_id, menuitem_id, quantity]
      );
    }

    res.status(200).json({ message: 'Item successfully added to cart!' });
  } catch (err) {
    console.error('Error adding item to cart:', err.stack);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});


// Ruta za prikaz korpe
router.get('/', ensureLoggedIn, async (req, res) => {
  const user_id = req.session.user.id;

  try {
    const cartItems = await pool.query(
      `SELECT c.id, c.quantity, m.name, m.price, m.image_url 
       FROM cart c 
       JOIN menuitems m ON c.menuitem_id = m.id 
       WHERE c.user_id = $1`,
      [user_id]
    );

    res.render('cart', { items: cartItems.rows, user: req.session.user });
  } catch (err) {
    console.error('Error fetching cart items:', err);
    res.status(500).send('Error fetching cart items');
  }
});

// Ruta za potvrdu narudžbe
router.post('/checkout', ensureLoggedIn, async (req, res) => {
  const user_id = req.session.user.id;

  try {
    // Kreirajte novu narudžbu
    const order = await pool.query(
      'INSERT INTO orders (user_id, created_at) VALUES ($1, CURRENT_TIMESTAMP) RETURNING id',
      [user_id]
    );

    const order_id = order.rows[0].id;

    await pool.query(
      `INSERT INTO order_items (order_id, menuitem_id, quantity)
       SELECT $1, menuitem_id, quantity FROM cart WHERE user_id = $2`,
      [order_id, user_id]
    );

    await pool.query('DELETE FROM cart WHERE user_id = $1', [user_id]);

    res.status(200).json({ message: 'Order placed successfully!', order_id });
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
