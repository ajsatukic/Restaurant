const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const { ensureAdmin } = require('../middlewares/auth');

// Prikaz admin dashboarda
router.get('/', ensureAdmin, (req, res) => {
    res.render('admin', { pageTitle: 'Admin Dashboard', user: req.session.user });
});

router.get('/menu', ensureAdmin, async (req, res) => {
    try {
      const query = 'SELECT * FROM menuitems ORDER BY id ASC';
      const result = await db.query(query); // Koristimo query, a ne execute
  
      res.render('menuAdmin', {
        menuItems: result.rows,
        pageTitle: 'Upravljanje Menijem',
      });
    } catch (err) {
      console.error('Greška pri dohvaćanju jela:', err);
      res.status(500).send('Greška na serveru');
    }
  });
  


// Ruta za dodavanje novog jela u meni
router.post('/menu/add', ensureAdmin, async (req, res) => {
    const { name, description, price, category, image_url } = req.body;

    try {
        // Unesi novo jelo u bazu
        const query = `
            INSERT INTO menuitems (name, description, price, category, image_url, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        await db.execute(query, [name, description, parseFloat(price), category, image_url]);

        res.redirect('/admin/menu');
    } catch (error) {
        console.error('Greška pri dodavanju jela:', error);
        res.status(500).send('Greška na serveru');
    }
});

// Ruta za brisanje jela iz menija
router.post('/menu/delete/:id', ensureAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        // Izbriši jelo iz baze
        const query = 'DELETE FROM menuitems WHERE id = ?';
        await db.execute(query, [id]);

        res.redirect('/admin/menu');
    } catch (error) {
        console.error('Greška pri brisanju jela:', error);
        res.status(500).send('Greška na serveru');
    }
});

// Ruta za uređivanje jela u meniju
router.post('/menu/edit/:id', ensureAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image_url } = req.body;

    try {
        // Ažuriraj jelo u bazi
        const query = `
            UPDATE menuitems
            SET name = ?, description = ?, price = ?, category = ?, image_url = ?
            WHERE id = ?
        `;
        await db.execute(query, [name, description, parseFloat(price), category, image_url, id]);

        res.redirect('/admin/menu');
    } catch (error) {
        console.error('Greška pri uređivanju jela:', error);
        res.status(500).send('Greška na serveru');
    }
});

// Rute za preusmjeravanje s admin kartica
router.get('/redirect/menu', ensureAdmin, (req, res) => {
    res.redirect('/admin/menu');
});

// Ruta za prikaz svih korisnika
router.get('/users', ensureAdmin, async (req, res) => {
    try {
        const query = 'SELECT * FROM users ORDER BY id ASC';
        const result = await db.query(query);

        res.render('usersAdmin', {
            users: result.rows,
            pageTitle: 'Upravljanje Korisnicima',
        });
    } catch (err) {
        console.error('Greška pri dohvaćanju korisnika:', err);
        res.status(500).send('Greška na serveru');
    }
});

// Ruta za brisanje korisnika
router.post('/users/delete/:id', ensureAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM users WHERE id = $1';
        await db.query(query, [id]);

        console.log(`Korisnik s ID-om ${id} uspješno obrisan.`);
        res.redirect('/admin/users');
    } catch (err) {
        console.error('Greška pri brisanju korisnika:', err);
        res.status(500).send('Greška na serveru');
    }
});


module.exports = router;
