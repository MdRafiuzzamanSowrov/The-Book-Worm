// auth.js
// -----------------------------------------------------------------
// Logic for the login page (index.html) and register page
// (register.html). Which form we're on is detected by which
// element exists in the page.
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) setupLoginForm(loginForm);
  if (registerForm) setupRegisterForm(registerForm);
});

function setupLoginForm(form) {
  const errorEl = document.getElementById('error-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // stop the browser's default page reload
    hideMessage(errorEl);

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const data = await apiRequest('/api/auth/login', 'POST', { username, password });
      // Store username locally so the dashboard can greet the user instantly
      localStorage.setItem('bookstore_username', data.username);
      window.location.href = 'books.html';
    } catch (err) {
      showMessage(errorEl, err.message); // e.g. "Incorrect username or password."
    }
  });
}

function setupRegisterForm(form) {
  const errorEl = document.getElementById('error-message');
  const successEl = document.getElementById('success-message');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage(errorEl);
    hideMessage(successEl);

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
      showMessage(errorEl, 'Passwords do not match.');
      return;
    }

    try {
      await apiRequest('/api/auth/register', 'POST', { username, email, password });
      showMessage(successEl, 'Account created! Redirecting to login...');
      setTimeout(() => { window.location.href = 'index.html'; }, 1500);
    } catch (err) {
      showMessage(errorEl, err.message); // e.g. "Username or email is already registered."
    }
  });
}
