import { api, formatPrice } from './api.js';
import {
  clearInlineMessage,
  ensureAuthenticated,
  escapeHtml,
  renderEmptyState,
  setButtonLoading,
  setFlashMessage,
  showInlineMessage
} from './ui.js';

const feedback = document.getElementById('cart-feedback');
const cartItemsList = document.getElementById('cart-items-list');
const cartPriceDetails = document.getElementById('cart-price-details');
const checkoutSection = document.getElementById('checkout-section');
const checkoutForm = document.getElementById('checkout-form');

if (ensureAuthenticated()) {
  loadCart();
}

function renderCart(cart) {
  if (cart.items.length === 0) {
    cartItemsList.innerHTML = renderEmptyState(
      'Your cart is empty',
      'Add a few products from the catalog to place your first order.',
      'Browse Products',
      './products.html'
    );
    cartPriceDetails.innerHTML = '';
    checkoutSection.classList.add('hidden');
    return;
  }

  checkoutSection.classList.remove('hidden');

  cartItemsList.innerHTML = cart.items
    .map((item) => {
      let imageUrl = item.imageUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=120&q=60';
      if (imageUrl.includes('unsplash.com')) {
        // Optimize for cart item thumbnail view (120px width, 60% quality)
        imageUrl = imageUrl.replace(/w=\d+/, 'w=120').replace(/q=\d+/, 'q=60');
      }
      const isLowStock = item.stock > 0 && item.stock <= 5;
      const isOutOfStock = item.stock <= 0;
      
      return `
        <div class="cart-item-card" data-product-id="${item.productId}">
          <div class="cart-item-card__main">
            <div class="cart-item-card__img">
              <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy" />
            </div>
            <div class="cart-item-card__info">
              <h3><a href="./product.html?id=${item.productId}">${escapeHtml(item.name)}</a></h3>
              <div class="cart-item-card__meta">
                <span class="cart-item-price">${formatPrice(item.price)}</span>
                <span class="stock-status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}">
                  ${isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${item.stock} left` : 'In Stock'}
                </span>
              </div>
              <p class="delivery-tag">Delivery in 2-4 days | <span class="free-text">FREE</span></p>
            </div>
          </div>
          <div class="cart-item-card__footer">
            <div class="quantity-badge">Qty: <strong>${item.quantity}</strong></div>
            <button class="btn btn--small btn--danger remove-cart-btn" type="button" data-remove-item="${item.productId}">
              Remove
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  // Calculate pricing elements (Flipkart style)
  const totalAmount = cart.summary.totalAmount;
  const deliveryCharges = totalAmount >= 4000 ? 0 : 400;
  const packagingFee = 79;
  const finalAmount = totalAmount + deliveryCharges + packagingFee;
  const mockSavings = (totalAmount * 0.15); // mock 15% discount for UI

  cartPriceDetails.innerHTML = `
    <div class="price-details-card__header">
      PRICE DETAILS
    </div>
    <div class="price-details-card__body">
      <div class="price-row">
        <span>Price (${cart.summary.itemCount} items)</span>
        <span>${formatPrice(totalAmount)}</span>
      </div>
      <div class="price-row">
        <span>Delivery Charges</span>
        <span class="free-text">${deliveryCharges === 0 ? 'FREE' : formatPrice(deliveryCharges)}</span>
      </div>
      <div class="price-row">
        <span>Secured Packaging Fee</span>
        <span>${formatPrice(packagingFee)}</span>
      </div>
      <hr class="price-divider" />
      <div class="price-row total-row">
        <span>Total Amount</span>
        <span>${formatPrice(finalAmount)}</span>
      </div>
      <div class="price-savings">
        You will save ${formatPrice(mockSavings)} on this order!
      </div>
    </div>
  `;
}

async function loadCart() {
  try {
    const cart = await api.getCart();
    renderCart(cart);
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to load your cart right now.',
      'error'
    );
  }
}

cartItemsList?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-remove-item]');

  if (!button) {
    return;
  }

  try {
    setButtonLoading(button, true, 'Removing...');
    await api.removeFromCart(Number(button.dataset.removeItem));
    showInlineMessage(feedback, 'Product removed from cart.', 'success');
    await loadCart();
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to remove that item right now.',
      'error'
    );
  } finally {
    setButtonLoading(button, false);
  }
});

checkoutForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearInlineMessage(feedback);

  const submitButton = checkoutForm.querySelector('button[type="submit"]');
  const shippingAddress = new FormData(checkoutForm).get('shippingAddress');

  try {
    setButtonLoading(submitButton, true, 'Placing order...');
    await api.placeOrder({ shippingAddress });
    setFlashMessage('Order placed successfully.');
    window.location.href = './orders.html';
  } catch (error) {
    let errorMsg = error.message || 'Unable to place your order right now.';
    if (error.details && error.details.length > 0) {
      errorMsg = error.details.map(d => d.message).join('. ');
    }
    showInlineMessage(
      feedback,
      errorMsg,
      'error'
    );
  } finally {
    setButtonLoading(submitButton, false);
  }
});
