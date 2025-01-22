const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Povezivanje s bazom podataka
const { ensureLoggedIn, ensureAdmin } = require('../middlewares/auth');

// Prikaz stranice `menuAdmin.ejs` sa svim stavkama menija
router.get('/', ensureAdmin, async (req, res) => {
    try {
        const query = 'SELECT * FROM menuitems ORDER BY id ASC';
        const result = await db.query(query);

        res.render('menuAdmin', {
            menuItems: result.rows, // Prosljeđivanje podataka iz baze u EJS
            pageTitle: 'Upravljanje Menijem',
        });
    } catch (err) {
        console.error('Greška pri dohvaćanju stavki menija:', err);
        res.status(500).send('Greška na serveru');
    }
});

// Ruta za dodavanje nove stavke menija
router.post('/add', ensureAdmin, async (req, res) => {
  const { name, description, price, category } = req.body;

  // Validacija podataka
  if (!name || !description || !price || !category) {
      console.error('Validacija neuspješna: Nedostaju obavezni podaci.');
      return res.redirect('/admin/menu?error=Nedostaju+obavezni+podaci');
  }

  try {
      const query = `
          INSERT INTO menuitems (name, description, price, category, created_at)
          VALUES ($1, $2, $3, $4, NOW())
      `;
      await db.query(query, [name, description, parseFloat(price), category]);

      console.log('Uspješno dodano jelo:', { name, description, price, category });
      res.redirect('/admin/menu?success=Jelo+uspješno+dodano');
  } catch (err) {
      console.error('Greška pri dodavanju jela:', err);
      res.status(500).send('Greška na serveru');
  }
});


// Ruta za uređivanje stavke menija
router.post('/edit', ensureAdmin, async (req, res) => {
    const { id, name, description, price, category } = req.body;

    try {
        const query = `
            UPDATE menuitems
            SET name = $1, description = $2, price = $3, category = $4
            WHERE id = $5
        `;
        await db.query(query, [name, description, parseFloat(price), category, id]);

        res.redirect('/admin/menu');
    } catch (err) {
        console.error('Greška pri uređivanju jela:', err);
        res.status(500).send('Greška na serveru');
    }
});

// Ruta za brisanje stavke menija
router.post('/delete/:id', ensureAdmin, async (req, res) => {
  const { id } = req.params;

  // Validacija ID-a
  if (!id) {
      console.error('Validacija neuspješna: ID nije poslan.');
      return res.redirect('/admin/menu?error=Nije+poslan+ID');
  }

  try {
      const query = `DELETE FROM menuitems WHERE id = $1`;
      await db.query(query, [id]);

      console.log('Uspješno obrisano jelo s ID-om:', id);
      res.redirect('/admin/menu?success=Jelo+uspješno+obrisano');
  } catch (err) {
      console.error('Greška pri brisanju jela:', err);
      res.status(500).send('Greška na serveru');
  }
});


module.exports = router;
