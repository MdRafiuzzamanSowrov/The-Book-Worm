// routes/books.js
// -----------------------------------------------------------------
// Full CRUD for the "books" table.
// All queries use "?" placeholders (parameterized queries) so user
// input is never concatenated into SQL strings -> prevents SQL
// injection attacks.
// -----------------------------------------------------------------
const express = require('express');
const pool = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

// ---------------------- READ (all books) ----------------------
router.get('/', requireLogin, async (req, res) => {
  try {
    const [books] = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(books);
  } catch (err) {
    console.error('Fetch books error:', err);
    res.status(500).json({ error: 'Could not load books.' });
  }
});

// ---------------------- READ (single book) ----------------------
router.get('/:id', requireLogin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Fetch book error:', err);
    res.status(500).json({ error: 'Could not load the book.' });
  }
});

// ---------------------- CREATE ----------------------
router.post('/', requireLogin, async (req, res) => {
  const { title, author, price, description, stock, image_url } = req.body;

  if (!title || !author || !price) {
    return res.status(400).json({ error: 'Title, author and price are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO books (title, author, price, description, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, author, price, description || '', stock || 0, image_url || '']
    );
    res.status(201).json({ message: 'Book added.', id: result.insertId });
  } catch (err) {
    console.error('Create book error:', err);
    res.status(500).json({ error: 'Could not add the book.' });
  }
});

// ---------------------- UPDATE ----------------------
router.put('/:id', requireLogin, async (req, res) => {
  const { title, author, price, description, stock, image_url } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE books
       SET title = ?, author = ?, price = ?, description = ?, stock = ?, image_url = ?
       WHERE id = ?`,
      [title, author, price, description, stock, image_url, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    res.json({ message: 'Book updated.' });
  } catch (err) {
    console.error('Update book error:', err);
    res.status(500).json({ error: 'Could not update the book.' });
  }
});

// ---------------------- DELETE ----------------------
router.delete('/:id', requireLogin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    res.json({ message: 'Book deleted.' });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ error: 'Could not delete the book.' });
  }
});

module.exports = router;
