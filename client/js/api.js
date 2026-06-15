const AUTH_STORAGE_KEY = 'demo_store_auth';
const ADMIN_AUTH_STORAGE_KEY = 'demo_store_admin_auth';

function parseStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

function parseStoredAdminAuth() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

export function getAuth() {
  return parseStoredAuth();
}

export function setAuth(payload) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event('authchange'));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event('authchange'));
}

export function getAdminAuth() {
  return parseStoredAdminAuth();
}

export function setAdminAuth(payload) {
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event('authchange'));
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event('authchange'));
}

export function isAdminUser() {
  return getAdminAuth()?.user?.role === 'admin';
}

async function request(path, options = {}) {
  const isAdminPath = path.startsWith('/admin');
  const token = isAdminPath ? getAdminAuth()?.token : getAuth()?.token;
  const headers = { ...(options.headers || {}) };
  const fetchOptions = {
    method: options.method || 'GET',
    headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body =
      typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);
  }

  const response = await fetch(`/api${path}`, fetchOptions);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.details = data.details || null;
    throw error;
  }

  return data;
}

export const api = {
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  adminLogin: (payload) =>
    request('/admin/login', { method: 'POST', body: payload }),
  getProducts: () => request('/products/'),
  getProduct: (id) => request(`/products/${id}`),
  getCart: () => request('/cart'),
  addToCart: (payload) => request('/cart/add', { method: 'POST', body: payload }),
  removeFromCart: (id) => request(`/cart/remove/${id}`, { method: 'DELETE' }),
  placeOrder: (payload) => request('/orders', { method: 'POST', body: payload }),
  getOrders: () => request('/orders'),
  createProduct: (payload) =>
    request('/admin/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) =>
    request(`/admin/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  getAdminOrders: () => request('/admin/orders')
};

export function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}
