-- ============================================================
-- Online Bookstore - Database Schema
-- ============================================================
-- ER SUMMARY (also see docs/ER_diagram.svg):
--   users (1) ----- (many) orders   [one user can place many orders]
--   books (1) ----- (many) orders   [one book can appear in many orders]
-- So `orders` is the "many" side that links users and books together.
-- ============================================================

CREATE DATABASE IF NOT EXISTS bookstore;
USE bookstore;

-- Drop in FK-safe order so this script can be re-run while testing
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
-- USERS  (entity)
-- ------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,   -- PK
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,            -- bcrypt hash, never plain text
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- BOOKS  (entity)
-- ------------------------------------------------------------
CREATE TABLE books (
  id          INT AUTO_INCREMENT PRIMARY KEY,     -- PK
  title       VARCHAR(150) NOT NULL,
  author      VARCHAR(100) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  description TEXT,
  stock       INT NOT NULL DEFAULT 0,
  image_url   VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- ORDERS  (relationship table between users and books)
-- Cardinality: one user -> many orders (1:N)
--              one book -> many orders (1:N)
-- ------------------------------------------------------------
CREATE TABLE orders (
  id          INT AUTO_INCREMENT PRIMARY KEY,     -- PK
  user_id     INT NOT NULL,                       -- FK -> users.id
  book_id     INT NOT NULL,                       -- FK -> books.id
  quantity    INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  order_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Sample books so the app isn't empty on first run
-- ------------------------------------------------------------
INSERT INTO books (title, author, price, description, stock, image_url) VALUES
('The Pragmatic Programmer', 'Andrew Hunt', 25.99, 'Classic guide to software craftsmanship.', 12, 'https://covers.openlibrary.org/b/id/8236303-L.jpg'),
('Clean Code', 'Robert C. Martin', 22.50, 'A handbook of agile software craftsmanship.', 8, 'https://covers.openlibrary.org/b/id/8091016-L.jpg'),
('Introduction to Algorithms', 'Thomas H. Cormen', 55.00, 'The classic algorithms textbook (CLRS).', 5, 'https://covers.openlibrary.org/b/id/8323742-L.jpg'),
('Database System Concepts', 'Abraham Silberschatz', 40.00, 'Comprehensive guide to database systems.', 10, 'https://covers.openlibrary.org/b/id/8264928-L.jpg'),
('Eloquent JavaScript', 'Marijn Haverbeke', 18.75, 'A modern introduction to programming with JS.', 15, 'https://covers.openlibrary.org/b/id/10521270-L.jpg');
