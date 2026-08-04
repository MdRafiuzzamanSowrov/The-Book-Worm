// db.js
// -----------------------------------------------------------------
// Creates a single reusable MySQL connection pool.
// A "pool" is used instead of one connection so multiple requests
// can query the database at the same time without waiting on
// each other.
// -----------------------------------------------------------------
require('dotenv').config();
const mysql = require('mysql2/promise'); // promise version lets us use async/await

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // max simultaneous connections
});

module.exports = pool;
