import { api, clearAuth, formatPrice, getAuth, getAdminAuth, clearAdminAuth } from './api.js';

const FLASH_STORAGE_KEY = 'demo_store_flash';

export function escapeHtml(value = '') {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[character]
  );
}

export function setFlashMessage(message, type = 'success') {
  sessionStorage.setItem(FLASH_STORAGE_KEY, JSON.stringify({ message, type }));
}

export function consumeFlashMessage() {
  const rawMessage = sessionStorage.getItem(FLASH_STORAGE_KEY);

  if (!rawMessage) {
    return null;
  }

  sessionStorage.removeItem(FLASH_STORAGE_KEY);

  try {
    return JSON.parse(rawMessage);
  } catch (error) {
    return null;
  }
}

function navLink(page, activePage, href, label, extraHtml = '') {
  return `
    <a class="nav-link ${page === activePage ? 'is-active' : ''}" href="${href}">
      ${label}${extraHtml}
    </a>
  `;
}

function pageHref(fileName) {
  const isAdminPage = window.location.pathname.includes('/admin/');
  
  if (isAdminPage) {
    if (fileName === 'admin.html' || fileName === 'admin/index.html') {
      return './index.html';
    }
    if (fileName.startsWith('assets/')) {
      return `../${fileName}`;
    }
    return `../${fileName}`;
  } else {
    if (fileName === 'admin.html' || fileName === 'admin/index.html') {
      return './admin/index.html';
    }
    return `./${fileName}`;
  }
}

export function mountShell(activePage = '') {
  const auth = getAuth();
  const adminAuth = getAdminAuth();
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');

  if (header) {
    header.className = 'site-header';
    
    if (activePage === 'admin') {
      header.innerHTML = `
        <div class="site-header__inner">
          <a class="brand" href="${pageHref('admin.html')}">
            <img src="${pageHref('assets/logo.jpg')}" alt="CodeAlpha Store" class="brand__logo-img" />
            <span class="badge-admin" style="background: var(--accent); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-left: 8px; font-weight: bold; text-transform: uppercase; vertical-align: middle;">Admin</span>
          </a>

          <nav class="nav-links" data-nav-menu>
            <a class="nav-link is-active" href="${pageHref('admin.html')}">Admin Dashboard</a>
            <a class="nav-link" href="${pageHref('index.html')}">View Store</a>
            
            <!-- Mobile Actions -->
            <div class="nav-actions mobile-actions">
              ${
                adminAuth
                  ? `
                    <span class="nav-user">Hi, Admin ${escapeHtml(adminAuth.user.name)}</span>
                    <button class="btn btn--small btn--outline" type="button" data-admin-logout-mobile>
                      Logout
                    </button>
                  `
                  : ''
              }
            </div>
          </nav>

          <div class="nav-actions desktop-actions">
            ${
              adminAuth
                ? `
                  <span class="nav-user">Hi, Admin ${escapeHtml(adminAuth.user.name)}</span>
                  <button class="btn btn--small btn--outline" type="button" data-admin-logout>
                    Logout
                  </button>
                `
                : ''
            }
          </div>

          <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-nav-toggle>
            <span class="nav-toggle__icon" aria-hidden="true">☰</span>
          </button>
        </div>
      `;

      const adminLogoutButton = header.querySelector('[data-admin-logout]');
      const adminLogoutButtonMobile = header.querySelector('[data-admin-logout-mobile]');

      const handleAdminLogout = () => {
        clearAdminAuth();
        window.location.reload();
      };

      if (adminLogoutButton) adminLogoutButton.addEventListener('click', handleAdminLogout);
      if (adminLogoutButtonMobile) adminLogoutButtonMobile.addEventListener('click', handleAdminLogout);

    } else {
      header.innerHTML = `
        <div class="site-header__inner">
          <a class="brand" href="${pageHref('index.html')}">
            <img src="${pageHref('assets/logo.jpg')}" alt="CodeAlpha Store" class="brand__logo-img" />
          </a>

          <nav class="nav-links" data-nav-menu>
            ${navLink('home', activePage, pageHref('index.html'), 'Home')}
            ${navLink('products', activePage, pageHref('products.html'), 'Products')}
            ${navLink('cart', activePage, pageHref('cart.html'), 'Cart', ` <span id="cart-count-badge" class="cart-count-badge hidden" data-cart-badge>0</span>`)}
            ${navLink('orders', activePage, pageHref('orders.html'), 'Orders')}
            ${adminAuth ? navLink('admin', activePage, pageHref('admin.html'), 'Admin') : ''}
            
            <!-- Mobile Actions -->
            <div class="nav-actions mobile-actions">
              ${
                auth
                  ? `
                    <span class="nav-user">Hi, ${escapeHtml(auth.user.name)}</span>
                    <button class="btn btn--small btn--outline" type="button" data-logout-mobile>
                      Logout
                    </button>
                  `
                  : `
                    <a class="btn btn--small btn--outline" href="${pageHref('login.html')}">Login</a>
                    <a class="btn btn--small btn--primary" href="${pageHref('register.html')}">Register</a>
                  `
              }
            </div>
          </nav>

          <div class="nav-actions desktop-actions">
            ${
              auth
                ? `
                  <span class="nav-user">Hi, ${escapeHtml(auth.user.name)}</span>
                  <button class="btn btn--small btn--outline" type="button" data-logout>
                    Logout
                  </button>
                `
                : `
                  <a class="btn btn--small btn--outline" href="${pageHref('login.html')}">Login</a>
                  <a class="btn btn--small btn--primary" href="${pageHref('register.html')}">Register</a>
                `
            }
          </div>

          <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-nav-toggle>
            <span class="nav-toggle__icon" aria-hidden="true">☰</span>
          </button>
        </div>
      `;

      const logoutButton = header.querySelector('[data-logout]');
      const logoutButtonMobile = header.querySelector('[data-logout-mobile]');

      const handleLogout = () => {
        clearAuth();
        window.location.href = pageHref('index.html');
      };

      if (logoutButton) logoutButton.addEventListener('click', handleLogout);
      if (logoutButtonMobile) logoutButtonMobile.addEventListener('click', handleLogout);

      if (auth) {
        api.getCart().then(cart => {
          const cartBadge = header.querySelector('[data-cart-badge]');
          if (cartBadge && cart.summary.itemCount > 0) {
            cartBadge.textContent = cart.summary.itemCount;
            cartBadge.classList.remove('hidden');
          }
        }).catch(() => {});
      }
    }
  }

  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="site-footer__inner">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <a class="brand" href="${pageHref('index.html')}">
              <img src="${pageHref('assets/logo.jpg')}" alt="CodeAlpha Store" class="brand__logo-img" />
            </a>
            <p class="footer-about">
              Elevating your lifestyle and home office setup with minimalist, premium essentials designed for modern living.
            </p>
            <div class="footer-socials">
              <a href="#" class="social-icon" aria-label="Facebook">FB</a>
              <a href="#" class="social-icon" aria-label="Instagram">IG</a>
              <a href="#" class="social-icon" aria-label="Twitter">TW</a>
            </div>
          </div>

          <div class="footer-col">
            <h3>Shop Collections</h3>
            <ul class="footer-links">
              <li><a href="${pageHref('products.html')}">All Products</a></li>
              <li><a href="${pageHref('products.html')}">Home Office</a></li>
              <li><a href="${pageHref('products.html')}">Electronics</a></li>
              <li><a href="${pageHref('products.html')}">Lifestyle</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h3>Customer Service</h3>
            <ul class="footer-links">
              <li><a href="#">Shipping Details</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
              <li><a href="#">FAQ & Support</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h3>Store Information</h3>
            <p class="footer-info-text">
              📍 Nanded, Maharashtra, India
            </p>
            <p class="footer-info-text">
              📧 support@codealphastore.com<br>
              📞 +1 (800) 555-0199
            </p>
          </div>
        </div>

        <div class="footer-bottom">
          <span class="copyright">&copy; 2026 CodeAlpha Store. All rights reserved.</span>
        </div>
      </div>
    `;
  }

  // Append bottom navigation bar (Flipkart style) on all pages for mobile screens
  if (!document.querySelector('.bottom-nav')) {
    const bottomNav = document.createElement('nav');
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = `
      <a href="${pageHref('index.html')}" class="bottom-nav__item ${activePage === 'home' ? 'active' : ''}">
        <span class="bottom-nav__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </span>
        <span class="bottom-nav__label">Home</span>
      </a>
      <a href="${pageHref('products.html')}" class="bottom-nav__item ${activePage === 'products' ? 'active' : ''}">
        <span class="bottom-nav__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </span>
        <span class="bottom-nav__label">Shop</span>
      </a>
      <a href="${pageHref('cart.html')}" class="bottom-nav__item ${activePage === 'cart' ? 'active' : ''}">
        <span class="bottom-nav__icon" style="position: relative;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <span id="bottom-cart-badge" class="bottom-cart-badge hidden">0</span>
        </span>
        <span class="bottom-nav__label">Cart</span>
      </a>
      <a href="${pageHref('orders.html')}" class="bottom-nav__item ${activePage === 'orders' ? 'active' : ''}">
        <span class="bottom-nav__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>
        </span>
        <span class="bottom-nav__label">Orders</span>
      </a>
      ${
        adminAuth
          ? `
            <a href="${pageHref('admin.html')}" class="bottom-nav__item ${activePage === 'admin' ? 'active' : ''}">
              <span class="bottom-nav__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </span>
              <span class="bottom-nav__label">Admin</span>
            </a>
          `
          : `
            <a href="${auth ? '#' : pageHref('login.html')}" class="bottom-nav__item ${activePage === 'login' ? 'active' : ''}" id="bottom-nav-profile">
              <span class="bottom-nav__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span class="bottom-nav__label">${auth ? 'Logout' : 'Account'}</span>
            </a>
          `
      }
    `;
    document.body.appendChild(bottomNav);

    // Logout click listener for bottom nav profile
    const bottomProfile = document.getElementById('bottom-nav-profile');
    if (bottomProfile && auth) {
      bottomProfile.addEventListener('click', (e) => {
        e.preventDefault();
        clearAuth();
        window.location.href = pageHref('index.html');
      });
    }
  }

  // Update badges for cart count on both header and bottom nav
  if (auth) {
    api.getCart().then(cart => {
      const cartCount = cart.summary.itemCount;
      if (cartCount > 0) {
        const cartBadge = document.querySelector('[data-cart-badge]');
        if (cartBadge) {
          cartBadge.textContent = cartCount;
          cartBadge.classList.remove('hidden');
        }
        const bottomCartBadge = document.getElementById('bottom-cart-badge');
        if (bottomCartBadge) {
          bottomCartBadge.textContent = cartCount;
          bottomCartBadge.classList.remove('hidden');
        }
      }
    }).catch(() => {});
  }
}

export function showInlineMessage(target, message, type = 'info') {
  if (!target) {
    return;
  }

  target.innerHTML = `<div class="notice notice--${type}">${escapeHtml(
    message
  )}</div>`;
}

export function clearInlineMessage(target) {
  if (target) {
    target.innerHTML = '';
  }
}

export function ensureAuthenticated({ adminOnly = false } = {}) {
  const auth = getAuth();

  if (!auth?.token) {
    const redirect = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`
    );
    window.location.href = `${pageHref('login.html')}?redirect=${redirect}`;
    return false;
  }

  if (adminOnly && auth.user.role !== 'admin') {
    window.location.href = pageHref('admin.html');
    return false;
  }

  return true;
}

export function setButtonLoading(button, isLoading, loadingText = 'Please wait...') {
  if (!button) {
    return;
  }

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  button.disabled = isLoading;
  button.textContent = isLoading
    ? loadingText
    : button.dataset.originalText;
}

export function renderEmptyState(title, message, actionLabel, actionHref) {
  return `
    <div class="empty-state">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      ${
        actionLabel && actionHref
          ? `<a class="btn btn--primary" href="${actionHref}">${escapeHtml(
              actionLabel
            )}</a>`
          : ''
      }
    </div>
  `;
}

function optimizeImageUrl(url) {
  const defaultPlaceholder = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=60';
  if (!url) return defaultPlaceholder;
  if (url.includes('unsplash.com')) {
    // Dynamically downscale image width to 300px and quality to 60%
    return url.replace(/w=\d+/, 'w=300').replace(/q=\d+/, 'q=60');
  }
  return url;
}

export function renderProductCard(product, { showQuickAdd = true } = {}) {
  const imageUrl = optimizeImageUrl(product.imageUrl);
  const rating = (4.1 + (product.id % 9) * 0.1).toFixed(1);
  const reviews = 8 + (product.id % 7) * 12;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card__media">
        ${isOutOfStock ? `<span class="product-card__badge out-of-stock">Sold Out</span>` : ''}
        ${isLowStock ? `<span class="product-card__badge low-stock">Low Stock</span>` : ''}
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.name)}" loading="lazy" />
      </div>
      <div class="product-card__body">
        <div class="product-card__meta">
          <span class="product-card__category">${escapeHtml(product.category)}</span>
          <div class="product-card__rating">
            <span class="stars">★★★★★</span>
            <span class="rating-value">${rating}</span>
            <span class="reviews-count">(${reviews})</span>
          </div>
        </div>
        <div class="product-card__content">
          <h3 class="product-card__title">
            <a href="${pageHref('product.html')}?id=${product.id}">${escapeHtml(product.name)}</a>
          </h3>
          <p class="product-card__description">${escapeHtml(product.description.slice(0, 85))}${
            product.description.length > 85 ? '...' : ''
          }</p>
        </div>
        <div class="product-card__footer">
          <strong class="price">${formatPrice(product.price)}</strong>
          <span class="stock-status ${isOutOfStock ? 'out-of-stock' : ''} ${isLowStock ? 'low-stock' : ''}">
            ${isOutOfStock ? 'Sold Out' : isLowStock ? `${product.stock} left` : 'In Stock'}
          </span>
        </div>
        <div class="product-card__actions">
          <a class="btn btn--outline btn--small" href="${pageHref('product.html')}?id=${product.id}">
            View Details
          </a>
          ${
            showQuickAdd && !isOutOfStock
              ? `
                <button class="btn btn--primary btn--small" type="button" data-add-to-cart="${product.id}">
                  Quick Add
                </button>
              `
              : ''
          }
        </div>
      </div>
    </article>
  `;
}

export function renderOrderItems(items) {
  return items
    .map(
      (item) =>
        `${escapeHtml(item.name)} x${item.quantity} (${formatPrice(item.lineTotal)})`
    )
    .join(', ');
}
