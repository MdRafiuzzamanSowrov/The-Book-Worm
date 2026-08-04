// books.js
// -----------------------------------------------------------------
// Logic for books.html: loads the catalog (READ) and lets the
// logged-in user place an order (CREATE) for a chosen quantity.
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  const username = await requireAuthOrRedirect(); // bounces to login if not authenticated
  if (!username) return;

  document.getElementById('welcome-user').textContent = `Hi, ${username}`;
  setupLogoutButton();
  await loadBooks();
});

async function loadBooks() {
  const grid = document.getElementById('book-grid');
  const errorEl = document.getElementById('error-message');
  hideMessage(errorEl);

  try {
    const books = await apiRequest('/api/books');
    renderBooks(grid, books);
  } catch (err) {
    showMessage(errorEl, err.message);
  }
}

function renderBooks(grid, books) {
  grid.innerHTML = ''; // clear previous content before re-rendering

  if (books.length === 0) {
    grid.innerHTML = '<p class="empty-state">No books available right now.</p>';
    return;
  }

  books.forEach((book) => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book.image_url || 'https://via.placeholder.com/200x260?text=Book'}" alt="Cover of ${book.title}">
      <h3>${book.title}</h3>
      <div class="author">by ${book.author}</div>
      <div class="price">$${Number(book.price).toFixed(2)}</div>
      <div class="stock">${book.stock > 0 ? book.stock + ' in stock' : 'Out of stock'}</div>
      <div class="qty-row">
        <input type="number" min="1" max="${book.stock}" value="1" id="qty-${book.id}" ${book.stock === 0 ? 'disabled' : ''}>
        <button class="small buy-btn" data-id="${book.id}" ${book.stock === 0 ? 'disabled' : ''}>Buy</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach one listener per "Buy" button
  document.querySelectorAll('.buy-btn').forEach((btn) => {
    btn.addEventListener('click', () => buyBook(btn.dataset.id));
  });
}

async function buyBook(bookId) {
  const errorEl = document.getElementById('error-message');
  const successEl = document.getElementById('success-message');
  hideMessage(errorEl);
  hideMessage(successEl);

  const quantity = Number(document.getElementById(`qty-${bookId}`).value);

  try {
    await apiRequest('/api/orders', 'POST', { book_id: bookId, quantity });
    showMessage(successEl, 'Order placed! Check "My Orders" to view it.');
    await loadBooks(); // refresh stock numbers
  } catch (err) {
    showMessage(errorEl, err.message);
  }
}
