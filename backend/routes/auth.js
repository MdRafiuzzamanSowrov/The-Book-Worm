// routes/auth.js
// -----------------------------------------------------------------
// Handles: register, login, logout, and "who am I" check.
// Passwords are hashed with bcrypt - we NEVER store plain text
// passwords in the database.
// -----------------------------------------------------------------
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();
const SALT_ROUNDS = 10; // cost factor for bcrypt hashing

// ---------------------- REGISTER ----------------------
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation - why: never trust data coming from the client
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are all required.' });
  }

  try {
    // Check if username/email is already taken
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?', // "?" placeholders stop SQL injection
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email is already registered.' });
    }

    // Hash the password before saving - why: protects users if the DB ever leaks
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    return res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (err) {
    // Proper error handling instead of letting the server crash
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Something went wrong while registering. Please try again.' });
  }
});

// ---------------------- LOGIN ----------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username]
    );

    // Same generic error for "no such user" and "wrong password" -
    // why: don't reveal whether the username exists (basic security practice)
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    // Save user info in the session -> browser gets a session cookie
    // that persists the login across pages (satisfies "cookies for
    // persistence of data among pages" requirement).
    req.session.userId = user.id;
    req.session.username = user.username;

    return res.json({ message: 'Login successful.', username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Something went wrong while logging in. Please try again.' });
  }
});

// ---------------------- LOGOUT ----------------------
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out. Please try again.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully.' });
  });
});

// ---------------------- CURRENT USER ----------------------
// Front end calls this on every protected page to check
// "is someone actually logged in?" before showing content.
router.get('/me', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ loggedIn: true, username: req.session.username });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;
