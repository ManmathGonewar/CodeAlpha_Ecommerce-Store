import { mountShell } from './ui.js';

function setupMobileNav() {
  const header = document.getElementById('site-header');
  if (!header) return;

  // mobile toggle button may be injected only after mountShell()
  const toggleBtn = header.querySelector('[data-nav-toggle]');
  const nav = header.querySelector('[data-nav-menu]');

  if (!toggleBtn || !nav) return;

  const setExpanded = (expanded) => {
    toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    nav.classList.toggle('nav-menu--open', expanded);
  };

  // init state
  setExpanded(false);

  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  // close on link click (mobile UX)
  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setExpanded(false));
  });

  // close on outside click
  document.addEventListener('click', (e) => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (!expanded) return;

    const target = e.target;
    if (!target) return;

    if (header.contains(target) && (target === toggleBtn || toggleBtn.contains?.(target))) {
      return;
    }

    if (nav.contains(target)) {
      return;
    }

    setExpanded(false);
  });
}

function boot() {
  const activePage = document.body.dataset.page || '';
  mountShell(activePage);

  // wait a tick for mountShell() html to be present
  setTimeout(setupMobileNav, 0);

  window.addEventListener('authchange', () => {
    mountShell(activePage);
    setTimeout(setupMobileNav, 0);
  });
}

boot();

