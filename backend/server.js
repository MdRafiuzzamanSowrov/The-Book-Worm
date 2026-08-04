// server.js
// -----------------------------------------------------------------
// Entry point: wires up middleware, routes, and static file serving
// for the front end, then starts the server.
// -----------------------------------------------------------------
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const orderRoutes = require('./routes/orders');

const app = express();

app.use(express.json()); // parse JSON request bodies

// Session middleware - creates the "connect.sid" cookie that keeps
// a user logged in as they move between pages.
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,   // JS on the page can't read this cookie -> safer
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  },
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);

// Serve the front-end static files (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Catch-all error handler - why: if any route forgets a try/catch,
// this stops the server from crashing and still returns a sane response.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bookstore server running at http://localhost:${PORT}`);
});
