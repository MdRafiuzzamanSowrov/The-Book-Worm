# Online Bookstore — CSE 3200 Final Project

A simple full-stack bookstore: register/login, browse books, place orders, view/edit/cancel your orders.

**Stack:** HTML/CSS/vanilla JS (front end) · Node.js + Express (back end) · MySQL (database) · bcrypt (password hashing) · express-session (login cookie)

---

## 1. Project structure

```
online-bookstore/
├── backend/
│   ├── server.js              # app entry point, wires everything together
│   ├── db.js                  # MySQL connection pool
│   ├── routes/
│   │   ├── auth.js            # register / login / logout / "who am I"
│   │   ├── books.js           # CRUD for books
│   │   └── orders.js          # CRUD for orders
│   ├── middleware/
│   │   └── authMiddleware.js  # blocks access if not logged in
│   ├── sql/schema.sql         # table definitions + sample data
│   └── .env.example           # copy to .env and fill in DB password
├── frontend/
│   ├── index.html             # login page
│   ├── register.html
│   ├── books.html             # protected: browse + buy
│   ├── orders.html            # protected: view/update/cancel orders
│   ├── css/style.css
│   └── js/
│       ├── utils.js           # shared fetch wrapper + auth guard (DRY)
│       ├── auth.js
│       ├── books.js
│       └── orders.js
└── docs/
    └── ER_diagram.svg / .png
```

## 2. How to run it

```bash
# 1. Create the database
mysql -u root -p < backend/sql/schema.sql

# 2. Configure the backend
cd backend
cp .env.example .env      # then edit .env with your MySQL password

# 3. Install & run
npm install
npm start                 # server runs at http://localhost:3000
```

Open `http://localhost:3000` in a browser — that's `index.html` (login page), served as a static file by Express.

## 3. How each requirement is met

| Requirement | Where in the code |
|---|---|
| Register + link to login | `register.html`, `POST /api/auth/register`, link at bottom of the card |
| Login + link to register, wrong-credential errors | `index.html`, `POST /api/auth/login`, same generic error for bad username/password |
| Logout | `POST /api/auth/logout`, "Log Out" button in navbar (`utils.js: setupLogoutButton`) |
| Can't use app without login | `authMiddleware.js` (`requireLogin`) on every books/orders route + `requireAuthOrRedirect()` on the front end |
| Pleasant UI / fonts / colors | `css/style.css` — cream/green/gold "reading room" palette, Playfair Display + Inter fonts |
| Proper HTML input types | `type="email"`, `type="password"`, `type="number"` in the forms |
| Separate JS files | `utils.js`, `auth.js`, `books.js`, `orders.js` |
| Clear names + comments explaining *why* | every file — comments explain the reasoning, not just what the line does |
| Indentation | consistent 2-space indentation throughout |
| DRY / modular utilities | `apiRequest()`, `showMessage()`, `requireAuthOrRedirect()` in `utils.js`, reused by every page |
| localStorage / cookies for persistence | session cookie (`connect.sid`) keeps you logged in across pages; `localStorage` caches the username to greet you instantly |
| Error handling (try/catch) | every async route handler (backend) and every fetch call (frontend) |
| ER diagram with PK/FK/types/cardinality | `docs/ER_diagram.svg` (or `.png`) |
| One example of each CRUD op + handler + query | see table below |
| SQL injection prevention | every query uses `?` placeholders (`mysql2` parameterized queries) — never string concatenation |

### CRUD examples (handler + query)

| Op | Route | File | Query |
|---|---|---|---|
| CREATE | `POST /api/books` | `routes/books.js` | `INSERT INTO books (...) VALUES (?, ?, ?, ?, ?, ?)` |
| READ | `GET /api/books` | `routes/books.js` | `SELECT * FROM books ORDER BY created_at DESC` |
| UPDATE | `PUT /api/books/:id` | `routes/books.js` | `UPDATE books SET ... WHERE id = ?` |
| DELETE | `DELETE /api/books/:id` | `routes/books.js` | `DELETE FROM books WHERE id = ?` |

`orders.js` has the same 4 operations for orders (placing, viewing, changing quantity, cancelling), and additionally demonstrates a `JOIN` between `orders` and `books`.

## 4. Database design (ER diagram)

See `docs/ER_diagram.svg`.

- **users** (1) → (many) **orders** — one user can place many orders
- **books** (1) → (many) **orders** — one book can appear in many orders
- `orders` is the linking table holding both foreign keys (`user_id`, `book_id`)

## 5. Likely viva questions (so you can rehearse answers)

**Q: How does the server know I'm logged in on a different page?**
A: On login, `req.session.userId` is set. Express-session signs a session ID and sends it to the browser as an `httpOnly` cookie (`connect.sid`). The browser auto-sends that cookie on every request (`credentials: 'include'` in `apiRequest`), so `authMiddleware.js` can check `req.session.userId` on each protected route.

**Q: Where is localStorage used, and why not put everything there?**
A: `localStorage` stores the username so the page can greet the user without an extra request. It is *not* used for the session/auth token, because localStorage is readable by any JS on the page (XSS risk) — the actual login state lives in the `httpOnly` session cookie, which JS cannot read.

**Q: How do you prevent SQL injection?**
A: Every query uses `?` placeholders and passes user input as a parameter array to `mysql2`, e.g. `pool.query('SELECT * FROM users WHERE username = ?', [username])`. The library escapes the value — user input is never concatenated directly into the SQL string.

**Q: Why bcrypt instead of storing the password directly?**
A: bcrypt hashes the password with a random salt (`SALT_ROUNDS = 10`), so even if the database leaks, an attacker cannot read the original passwords. On login, `bcrypt.compare()` re-hashes the entered password and compares hashes — the plain password is never stored or compared directly.

**Q: Explain the ER diagram relationships.**
A: `users` and `books` are independent entities. `orders` is the join/relationship entity: each order row has one `user_id` and one `book_id` (both foreign keys), so one user can have many orders and one book can appear in many orders — two 1:N relationships meeting at `orders`.

**Q: Walk me through what happens when I click "Buy".**
A: Front end (`books.js`) reads the quantity input, calls `apiRequest('/api/orders', 'POST', {book_id, quantity})`. Backend (`routes/orders.js`) checks login via middleware, looks up the book's price/stock, rejects if not enough stock, inserts a row into `orders`, and decrements `books.stock`. Response goes back to the front end, which shows a success message and reloads the book list.

**Q: How is error handling done?**
A: Backend: every route handler wraps its database calls in `try/catch`; on failure it logs the real error to the server console but sends the user a safe, readable message with an appropriate HTTP status code (400/401/404/500). Frontend: `apiRequest()` throws on a non-OK response, and every page's calling code wraps that in `try/catch` to display the message via `showMessage()`.

**Q: Why is there a `middleware` folder?**
A: `authMiddleware.js`'s `requireLogin` function runs before the actual route handler on every protected route. It's written once and reused everywhere (`router.get('/', requireLogin, ...)`), instead of repeating the same login check inside every handler — that's the DRY principle applied on the backend.

## 6. Notes for the team

- Remember: **20 git pushes** required in the front-end phase, **10** in the back-end phase, from all members — commit small and often rather than one giant push.
- Presentation is 4–6 minutes, live demo of CRUD, no code shown, mention who did what and what problems you hit.
