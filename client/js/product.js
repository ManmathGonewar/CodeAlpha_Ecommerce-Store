import { api, formatPrice, getAuth } from './api.js';
import {
  clearInlineMessage,
  escapeHtml,
  renderEmptyState,
  setButtonLoading,
  showInlineMessage
} from './ui.js';

const feedback = document.getElementById('product-feedback');
const detailContainer = document.getElementById('product-detail');
const productId = new URLSearchParams(window.location.search).get('id');

function renderProduct(product) {
  let imageUrl = product.imageUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=75';
  if (imageUrl.includes('unsplash.com')) {
    // Optimize for details page view (600px width, 75% quality)
    imageUrl = imageUrl.replace(/w=\d+/, 'w=600').replace(/q=\d+/, 'q=75');
  }
  const isOutOfStock = product.stock <= 0;
  const rating = (4.1 + (product.id % 9) * 0.1).toFixed(1);
  const reviews = 8 + (product.id % 7) * 12;

  detailContainer.innerHTML = `
    <div class="detail-layout">
      <article class="detail-card">
        <div class="detail-card__image">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" />
        </div>
      </article>
      <article class="detail-card">
        <div class="detail-card__body">
          <nav class="breadcrumb">
            <a href="./products.html">Catalog</a> / <span class="muted">${escapeHtml(product.category)}</span>
          </nav>
          <h1 class="detail-title">${escapeHtml(product.name)}</h1>
          
          <div class="detail-rating">
            <div class="stars">★★★★★</div>
            <span class="rating-text"><strong>${rating}</strong> out of 5 stars (${reviews} customer reviews)</span>
          </div>

          <div class="detail-price-box">
            <strong class="detail-price">${formatPrice(product.price)}</strong>
            ${product.stock <= 5 && product.stock > 0 ? `<span class="detail-badge low-stock">Only ${product.stock} left — order soon</span>` : ''}
            ${isOutOfStock ? `<span class="detail-badge out-of-stock">Out of Stock</span>` : ''}
          </div>

          <div class="detail-description">
            <h3>Product Description</h3>
            <p>${escapeHtml(product.description)}</p>
          </div>

          <!-- Color Selector -->
          <div class="product-selector">
            <span class="selector-label">Color: <strong id="selected-color">Obsidian Black</strong></span>
            <div class="color-options">
              <button class="color-dot active" style="background-color: #0f172a;" title="Obsidian Black" data-color="Obsidian Black" type="button"></button>
              <button class="color-dot" style="background-color: #cbd5e1;" title="Pure White" data-color="Pure White" type="button"></button>
              <button class="color-dot" style="background-color: #4f46e5;" title="Electric Indigo" data-color="Electric Indigo" type="button"></button>
            </div>
          </div>

          <!-- Size Selector -->
          <div class="product-selector">
            <span class="selector-label">Size: <strong id="selected-size">M</strong></span>
            <div class="size-options">
              <button class="size-btn" data-size="S" type="button">S</button>
              <button class="size-btn active" data-size="M" type="button">M</button>
              <button class="size-btn" data-size="L" type="button">L</button>
              <button class="size-btn" data-size="XL" type="button">XL</button>
            </div>
          </div>

          <form id="add-to-cart-form" class="form-grid" style="margin-top: 1.8rem;">
            <label class="form-label detail-quantity">
              Quantity
              <input type="number" name="quantity" min="1" max="${Math.max(product.stock, 1)}" value="1" ${
                isOutOfStock ? 'disabled' : ''
              } required />
            </label>
            <div class="full-width detail-card__actions">
              <button class="btn btn--primary btn--large" type="submit" ${
                isOutOfStock ? 'disabled' : ''
              }>
                ${isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}
              </button>
              <a class="btn btn--outline" href="./products.html">Continue Shopping</a>
            </div>
          </form>

          <div class="trust-indicators">
            <div class="trust-item">
              <span class="icon">⚡</span>
              <span class="text"><strong>Free Express Shipping</strong> on orders over ₹4,000</span>
            </div>
            <div class="trust-item">
              <span class="icon">🛡️</span>
              <span class="text"><strong>Secure Checkout</strong> with SSL encryption</span>
            </div>
            <div class="trust-item">
              <span class="icon">🔄</span>
              <span class="text"><strong>30-Day Returns</strong> & money-back guarantee</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  `;

  // Selector Event Listeners
  const colorDots = detailContainer.querySelectorAll('.color-dot');
  const selectedColorEl = document.getElementById('selected-color');
  colorDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      colorDots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
      if (selectedColorEl) selectedColorEl.textContent = dot.dataset.color;
    });
  });

  const sizeBtns = detailContainer.querySelectorAll('.size-btn');
  const selectedSizeEl = document.getElementById('selected-size');
  sizeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (selectedSizeEl) selectedSizeEl.textContent = btn.dataset.size;
    });
  });

  const form = document.getElementById('add-to-cart-form');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearInlineMessage(feedback);

    if (isOutOfStock) {
      showInlineMessage(feedback, 'This product is currently out of stock.', 'error');
      return;
    }

    if (!getAuth()?.token) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `./login.html?redirect=${redirect}`;
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const quantity = Number(new FormData(form).get('quantity'));

    try {
      setButtonLoading(submitButton, true, 'Adding to bag...');
      await api.addToCart({ productId: Number(product.id), quantity });
      showInlineMessage(feedback, 'Successfully added to your shopping bag.', 'success');

      // Instantly update the cart dynamic badge in the header nav
      api.getCart().then((cart) => {
        const cartBadge = document.querySelector('[data-cart-badge]');
        if (cartBadge && cart.summary.itemCount > 0) {
          cartBadge.textContent = cart.summary.itemCount;
          cartBadge.classList.remove('hidden');
        }
      }).catch(() => {});

    } catch (error) {
      showInlineMessage(
        feedback,
        error.message || 'Unable to add that product right now.',
        'error'
      );
    } finally {
      setButtonLoading(submitButton, false);
    }
  });
}

async function loadProduct() {
  if (!productId) {
    detailContainer.innerHTML = renderEmptyState(
      'Product not selected',
      'Choose a product from the catalog to view its full details.',
      'Browse Products',
      './products.html'
    );
    return;
  }

  try {
    const product = await api.getProduct(productId);
    renderProduct(product);
  } catch (error) {
    detailContainer.innerHTML = renderEmptyState(
      'Product unavailable',
      error.message || 'We could not find that product.',
      'Browse Products',
      './products.html'
    );
  }
}

loadProduct();
