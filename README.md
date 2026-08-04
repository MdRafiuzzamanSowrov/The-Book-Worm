# The Book Worm — CSE3200 (Web Programming Sessional) Final Project

A simple full-stack bookstore: register/login, browse books, place orders, view/edit/cancel your orders.

**Stack:** HTML/CSS/vanilla JS (front end) · Node.js + Express (back end) · MySQL (database) · bcrypt (password hashing) · express-session (login cookie)

---
<img width="1920" height="921" alt="image" src="https://github.com/user-attachments/assets/b90877e8-4ade-4d73-a41b-89b33e27d35a" />

<img width="1920" height="927" alt="image" src="https://github.com/user-attachments/assets/627fd7ed-22d0-464c-8689-053c799f8139" />

<img width="1912" height="924" alt="image" src="https://github.com/user-attachments/assets/e9d98c9d-e926-48e3-b886-de136b104641" />

<img width="1920" height="924" alt="image" src="https://github.com/user-attachments/assets/c9416e17-47ab-4f1e-8b36-0396f521c248" />



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






   
## Contact

Created by Md.Rafiuzzaman Sowrov — feel free to reach out via email at rafiuzzamansourov@gmail.com or connect on Linkedin with https://www.linkedin.com/in/rafiuzzaman-sourov-715b78279/ or visit my portfolio: https://mdrafiuzzamansourov.lovable.app/
