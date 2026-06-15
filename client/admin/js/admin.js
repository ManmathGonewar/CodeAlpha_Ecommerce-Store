import { api, formatDate, formatPrice, getAdminAuth, setAdminAuth, clearAdminAuth, getAuth } from '../../js/api.js';
import {
  clearInlineMessage,
  escapeHtml,
  renderEmptyState,
  setButtonLoading,
  showInlineMessage
} from '../../js/ui.js';

// Access Control: Redirect if the user is logged in as a regular customer
function checkAdminAccess() {
  const normalUser = getAuth();
  const adminUser = getAdminAuth();
  
  if (normalUser && (!adminUser || adminUser.user.role !== 'admin')) {
    alert('Access Denied: You do not have administrator privileges.');
    window.location.href = '../index.html';
    return false;
  }
  return true;
}

if (!checkAdminAccess()) {
  throw new Error('Access denied');
}

const feedback = document.getElementById('admin-feedback');
const authSection = document.getElementById('admin-auth-section');
const dashboard = document.getElementById('admin-dashboard');
const adminLoginForm = document.getElementById('admin-login-form');
const productForm = document.getElementById('product-form');
const productsTableBody = document.getElementById('admin-products-table');
const ordersTableBody = document.getElementById('admin-orders-table');
const formTitle = document.getElementById('product-form-title');
const cancelEditButton = document.getElementById('cancel-edit');
let productsCache = [];

function isAdminAuthenticated() {
  return getAdminAuth()?.user?.role === 'admin';
}

function toggleAdminView() {
  const adminLoggedIn = isAdminAuthenticated();
  authSection.classList.toggle('hidden', adminLoggedIn);
  dashboard.classList.toggle('hidden', !adminLoggedIn);

  if (adminLoggedIn) {
    loadDashboard();
  }
}

function resetProductForm() {
  productForm.reset();
  productForm.elements.productId.value = '';
  formTitle.textContent = 'Add Product';
  cancelEditButton.classList.add('hidden');
}

async function handleAdminLogin(event) {
  event.preventDefault();
  clearInlineMessage(feedback);

  const submitButton = adminLoginForm.querySelector('button[type="submit"]');
  const formData = new FormData(adminLoginForm);

  try {
    setButtonLoading(submitButton, true, 'Signing in...');
    const response = await api.adminLogin({
      email: formData.get('email'),
      password: formData.get('password')
    });

    setAdminAuth({ token: response.token, user: response.user });
    adminLoginForm.reset();
    showInlineMessage(feedback, 'Admin session started.', 'success');
    toggleAdminView();
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to log into the admin dashboard right now.',
      'error'
    );
  } finally {
    setButtonLoading(submitButton, false);
  }
}

async function loadProducts() {
  productsCache = await api.getProducts();

  productsTableBody.innerHTML =
    productsCache.length > 0
      ? productsCache
          .map(
            (product) => `
              <tr>
                <td><strong>${escapeHtml(product.name)}</strong></td>
                <td>${escapeHtml(product.category)}</td>
                <td>${formatPrice(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                  <div class="split">
                    <button class="btn btn--small btn--outline" type="button" data-edit-product-id="${product.id}">
                      Edit
                    </button>
                    <button class="btn btn--small btn--danger" type="button" data-delete-product="${product.id}">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            `
          )
          .join('')
      : `
        <tr>
          <td colspan="5">
            ${renderEmptyState(
              'No products found',
              'Use the form above to add the first product.',
              '',
              ''
            )}
          </td>
        </tr>
      `;
}

async function loadOrders() {
  const orders = await api.getAdminOrders();

  ordersTableBody.innerHTML =
    orders.length > 0
      ? orders
          .map(
            (order) => `
              <tr>
                <td>#${order.id}</td>
                <td>
                  <strong>${escapeHtml(order.customerName)}</strong>
                  <div class="muted">${escapeHtml(order.customerEmail)}</div>
                </td>
                <td>${formatPrice(order.totalAmount)}</td>
                <td>${order.status}</td>
                <td class="order-items">${order.items
                  .map((item) => `${escapeHtml(item.name)} x${item.quantity}`)
                  .join(', ')}</td>
                <td>${formatDate(order.createdAt)}</td>
              </tr>
            `
          )
          .join('')
      : `
        <tr>
          <td colspan="6">
            ${renderEmptyState(
              'No orders yet',
              'Customer orders will appear here once checkout starts happening.',
              '',
              ''
            )}
          </td>
        </tr>
      `;
}

async function loadDashboard() {
  try {
    await Promise.all([loadProducts(), loadOrders()]);
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to load the admin dashboard right now.',
      'error'
    );
  }
}

adminLoginForm?.addEventListener('submit', handleAdminLogin);

productForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearInlineMessage(feedback);

  const submitButton = productForm.querySelector('button[type="submit"]');
  const formData = new FormData(productForm);
  const productId = formData.get('productId');
  const payload = {
    name: formData.get('name'),
    description: formData.get('description'),
    price: Number(formData.get('price')),
    imageUrl: formData.get('imageUrl'),
    category: formData.get('category'),
    stock: Number(formData.get('stock'))
  };

  try {
    setButtonLoading(
      submitButton,
      true,
      productId ? 'Updating...' : 'Creating...'
    );

    if (productId) {
      await api.updateProduct(productId, payload);
      showInlineMessage(feedback, 'Product updated successfully.', 'success');
    } else {
      await api.createProduct(payload);
      showInlineMessage(feedback, 'Product created successfully.', 'success');
    }

    resetProductForm();
    await loadProducts();
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to save that product right now.',
      'error'
    );
  } finally {
    setButtonLoading(submitButton, false);
  }
});

cancelEditButton?.addEventListener('click', resetProductForm);

productsTableBody?.addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-product-id]');
  const deleteButton = event.target.closest('[data-delete-product]');

  if (editButton) {
    const productId = Number(editButton.dataset.editProductId);
    const product = productsCache.find((entry) => entry.id === productId);

    if (!product) {
      showInlineMessage(feedback, 'Unable to find that product.', 'error');
      return;
    }

    productForm.elements.productId.value = product.id;
    productForm.elements.name.value = product.name;
    productForm.elements.description.value = product.description;
    productForm.elements.price.value = product.price;
    productForm.elements.imageUrl.value = product.imageUrl || '';
    productForm.elements.category.value = product.category;
    productForm.elements.stock.value = product.stock;
    formTitle.textContent = 'Edit Product';
    cancelEditButton.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (!deleteButton) {
    return;
  }

  const productId = Number(deleteButton.dataset.deleteProduct);
  const confirmed = window.confirm(
    'Delete this product from the catalog?'
  );

  if (!confirmed) {
    return;
  }

  try {
    setButtonLoading(deleteButton, true, 'Deleting...');
    await api.deleteProduct(productId);
    showInlineMessage(feedback, 'Product deleted successfully.', 'success');
    resetProductForm();
    await loadProducts();
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to delete that product right now.',
      'error'
    );
  } finally {
    setButtonLoading(deleteButton, false);
  }
});

toggleAdminView();
