// routes/orders.js
// -----------------------------------------------------------------
// CRUD for "orders" - the table that links a user to the book(s)
// they bought (demonstrates the 1:N relationships from the ER
// diagram). Every route is protected: only the logged-in user can
// see/change THEIR OWN orders (checked with "AND user_id = ?").
// -----------------------------------------------------------------
const express = require('express');
const pool = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

const router = express.Router();

// ---------------------- CREATE (place an order) ----------------------
router.post('/', requireLogin, async (req, res) => {
  const { book_id, quantity } = req.body;
  const userId = req.session.userId;

  if (!book_id || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'A valid book and quantity are required.' });
  }

  try {
    const [bookRows] = await pool.query('SELECT price, stock FROM books WHERE id = ?', [book_id]);
    if (bookRows.length === 0) {
      return res.status(404).json({ error: 'Book not found.' });
    }
    const book = bookRows[0];
    if (book.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock available.' });
    }

    const totalPrice = (book.price * quantity).toFixed(2);

    const [result] = await pool.query(
      'INSERT INTO orders (user_id, book_id, quantity, total_price) VALUES (?, ?, ?, ?)',
      [userId, book_id, quantity, totalPrice]
    );

    // Reduce stock now that the "purchase" happened
    await pool.query('UPDATE books SET stock = stock - ? WHERE id = ?', [quantity, book_id]);

    res.status(201).json({ message: 'Order placed.', id: result.insertId });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Could not place the order.' });
  }
});

// ---------------------- READ (my orders) ----------------------
router.get('/', requireLogin, async (req, res) => {
  try {
    // JOIN so we can show the book title/author alongside each order
    const [orders] = await pool.query(
      `SELECT orders.id, orders.quantity, orders.total_price, orders.order_date,
              books.title, books.author
       FROM orders
       JOIN books ON books.id = orders.book_id
       WHERE orders.user_id = ?
       ORDER BY orders.order_date DESC`,
      [req.session.userId]
    );
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Could not load your orders.' });
  }
});

// ---------------------- UPDATE (change quantity) ----------------------
router.put('/:id', requireLogin, async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1.' });
  }

  try {
    // "AND user_id = ?" makes sure a user can only edit THEIR OWN order
    const [result] = await pool.query(
      'UPDATE orders SET quantity = ?, total_price = (SELECT price FROM books WHERE id = orders.book_id) * ? WHERE id = ? AND user_id = ?',
      [quantity, quantity, req.params.id, req.session.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ message: 'Order updated.' });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ error: 'Could not update the order.' });
  }
});

// ---------------------- DELETE (cancel order) ----------------------
router.delete('/:id', requireLogin, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ message: 'Order cancelled.' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Could not cancel the order.' });
  }
});

module.exports = router;
