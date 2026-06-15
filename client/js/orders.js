import { api, formatDate, formatPrice } from './api.js';
import {
  consumeFlashMessage,
  ensureAuthenticated,
  escapeHtml,
  renderEmptyState,
  showInlineMessage
} from './ui.js';

const feedback = document.getElementById('orders-feedback');
const ordersList = document.getElementById('orders-list');

if (ensureAuthenticated()) {
  const flash = consumeFlashMessage();

  if (flash) {
    showInlineMessage(feedback, flash.message, flash.type);
  }

  loadOrders();
}

function renderOrders(orders) {
  if (orders.length === 0) {
    ordersList.innerHTML = renderEmptyState(
      'No orders yet',
      'Your order history will appear here after you place your first order.',
      'Browse Products',
      './products.html'
    );
    return;
  }

  ordersList.innerHTML = orders
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-card__head">
            <div>
              <h3>Order #${order.id}</h3>
              <p>Placed on ${formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span class="badge">${order.status}</span>
              <strong class="price" style="display:block; margin-top: 0.45rem;">${formatPrice(
                order.totalAmount
              )}</strong>
            </div>
          </div>
          <p><strong>Shipping:</strong> ${escapeHtml(order.shippingAddress)}</p>
          <div class="order-card__items">
            ${order.items
              .map(
                (item) => `
                  <div class="panel-card">
                    <strong>${escapeHtml(item.name)}</strong>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Line total: ${formatPrice(item.lineTotal)}</p>
                  </div>
                `
              )
              .join('')}
          </div>
        </article>
      `
    )
    .join('');
}

async function loadOrders() {
  try {
    const orders = await api.getOrders();
    renderOrders(orders);
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to load your orders right now.',
      'error'
    );
  }
}
