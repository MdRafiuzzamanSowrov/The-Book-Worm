// utils.js
// -----------------------------------------------------------------
// Small reusable helpers shared by every page. Keeping them in one
// file (instead of copy-pasting fetch logic everywhere) is what the
// requirement calls "modular utility functions / DRY".
// -----------------------------------------------------------------

/**
 * apiRequest - a single wrapper around fetch() used by every page.
 * Why: every request needs the same JSON headers, cookie handling,
 * and error handling, so we write it once here instead of repeating
 * it in auth.js / books.js / orders.js.
 */
async function apiRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // send the session cookie with every request
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({})); // handle empty body safely

    if (!response.ok) {
      // Throw so the calling page's try/catch can show the message
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }
    return data;
  } catch (err) {
    // Network failure (server down, no internet, etc.) ends up here too
    throw err;
  }
}

/** Show a message in an element that has .error-message / .success-message class */
function showMessage(el, text) {
  el.textContent = text;
  el.style.display = 'block';
}

function hideMessage(el) {
  el.style.display = 'none';
}

/**
 * requireAuthOrRedirect - called at the top of every protected page.
 * Why: satisfies "a user should not be able to access the app
 * without a successful login" - if the session check fails, we
 * bounce the visitor back to the login page immediately.
 */
async function requireAuthOrRedirect() {
  try {
    const data = await apiRequest('/api/auth/me');
    if (!data.loggedIn) {
      window.location.href = 'index.html';
      return null;
    }
    // Keep the username handy in localStorage so other pages/components
    // can greet the user without an extra request (persistence example).
    localStorage.setItem('bookstore_username', data.username);
    return data.username;
  } catch (err) {
    window.location.href = 'index.html';
    return null;
  }
}

/** Wire up the logout button that appears on every protected page's navbar */
function setupLogoutButton() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    try {
      await apiRequest('/api/auth/logout', 'POST');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('bookstore_username');
      window.location.href = 'index.html';
    }
  });
}
