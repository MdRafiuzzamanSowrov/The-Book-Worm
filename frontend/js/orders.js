// orders.js
// -----------------------------------------------------------------
// Logic for orders.html: shows the logged-in user's own orders
// (READ), lets them change the quantity (UPDATE) or cancel an
// order (DELETE).
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  const username = await requireAuthOrRedirect();
  if (!username) return;

  document.getElementById('welcome-user').textContent = `Hi, ${username}`;
  setupLogoutButton();
  await loadOrders();
});

async function loadOrders() {
  const tbody = document.getElementById('orders-body');
  const errorEl = document.getElementById('error-message');
  hideMessage(errorEl);

  try {
    const orders = await apiRequest('/api/orders');
    renderOrders(tbody, orders);
  } catch (err) {
    showMessage(errorEl, err.message);
  }
}

function renderOrders(tbody, orders) {
  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state">You have not ordered any books yet.</td></tr>';
    return;
  }

  orders.forEach((order) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.title} <br><span class="author">by ${order.author}</span></td>
      <td><input type="number" min="1" value="${order.quantity}" id="qty-${order.id}" style="width:60px;"></td>
      <td>$${Number(order.total_price).toFixed(2)}</td>
      <td>${new Date(order.order_date).toLocaleDateString()}</td>
      <td>
        <button class="small update-btn" data-id="${order.id}">Update</button>
        <button class="small danger cancel-btn" data-id="${order.id}">Cancel</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.querySelectorAll('.update-btn').forEach((btn) => {
    btn.addEventListener('click', () => updateOrder(btn.dataset.id));
  });
  document.querySelectorAll('.cancel-btn').forEach((btn) => {
    btn.addEventListener('click', () => cancelOrder(btn.dataset.id));
  });
}

async function updateOrder(orderId) {
  const errorEl = document.getElementById('error-message');
  hideMessage(errorEl);
  const quantity = Number(document.getElementById(`qty-${orderId}`).value);

  try {
    await apiRequest(`/api/orders/${orderId}`, 'PUT', { quantity });
    await loadOrders();
  } catch (err) {
    showMessage(errorEl, err.message);
  }
}

async function cancelOrder(orderId) {
  const errorEl = document.getElementById('error-message');
  hideMessage(errorEl);

  try {
    await apiRequest(`/api/orders/${orderId}`, 'DELETE');
    await loadOrders();
  } catch (err) {
    showMessage(errorEl, err.message);
  }
}
