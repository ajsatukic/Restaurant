const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Pretpostavka da koristite db konfiguraciju za povezivanje

// Ruta za prikaz svih narudžbi iz baze
router.get('/', async (req, res) => {
    try {
        // Dohvat narudžbi iz baze, pridruživanje korisnika i stavki narudžbe
        const query = `
            SELECT 
                o.id AS order_id,
                u.name AS user_name,
                GROUP_CONCAT(CONCAT(oi.quantity, 'x ', m.name) SEPARATOR ', ') AS items,
                o.total_price AS total,
                o.status
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON oi.order_id = o.id
            JOIN menuitems m ON oi.menuitem_id = m.id
            GROUP BY o.id
        `;
        const [orders] = await db.execute(query);

        // Render stranice sa narudžbama
        res.render('orders', { orders });
    } catch (error) {
        console.error('Greška pri dohvaćanju narudžbi:', error);
        res.status(500).send('Greška na serveru');
    }
});

module.exports = router;
