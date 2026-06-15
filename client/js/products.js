import { api, getAuth } from './api.js';
import {
  clearInlineMessage,
  escapeHtml,
  renderEmptyState,
  renderProductCard,
  setButtonLoading,
  showInlineMessage
} from './ui.js';

const feedback = document.getElementById('products-feedback');
const searchInput = document.getElementById('product-search');
const categorySelect = document.getElementById('category-filter');
const productGrid = document.getElementById('product-grid');

let products = [];

function populateCategories() {
  const categories = [...new Set(products.map((product) => product.category))];
  categorySelect.innerHTML = `
    <option value="">All categories</option>
    ${categories
      .map(
        (category) =>
          `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
      )
      .join('')}
  `;
}

function renderProducts() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue) ||
      product.description.toLowerCase().includes(searchValue);
    const matchesCategory = !category || product.category === category;

    return matchesSearch && matchesCategory;
  });

  productGrid.innerHTML =
    filteredProducts.length > 0
      ? filteredProducts.map((product) => renderProductCard(product)).join('')
      : renderEmptyState(
          'No matching products',
          'Try a different search term or category to find what you need.',
          'Reset Filters',
          './products.html'
        );
}

async function loadProducts() {
  try {
    products = await api.getProducts();
    clearInlineMessage(feedback);
    populateCategories();

    // Check query params to pre-fill filters
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('search');
    const categoryQuery = params.get('category');

    if (searchQuery) {
      searchInput.value = searchQuery;
    }
    if (categoryQuery) {
      categorySelect.value = categoryQuery;
    }

    renderProducts();
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to load products right now.',
      'error'
    );
  }
}

searchInput?.addEventListener('input', renderProducts);
categorySelect?.addEventListener('change', renderProducts);

productGrid?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-add-to-cart]');

  if (!button) {
    return;
  }

  if (!getAuth()?.token) {
    const redirect = encodeURIComponent('./products.html');
    window.location.href = `./login.html?redirect=${redirect}`;
    return;
  }

  try {
    setButtonLoading(button, true, 'Adding...');
    await api.addToCart({
      productId: Number(button.dataset.addToCart),
      quantity: 1
    });
    showInlineMessage(feedback, 'Product added to cart.', 'success');
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to add that product right now.',
      'error'
    );
  } finally {
    setButtonLoading(button, false);
  }
});

loadProducts();
