import { api } from './api.js';
import { renderEmptyState, renderProductCard, showInlineMessage } from './ui.js';

const featuredProducts = document.getElementById('featured-products');
const bestsellerProducts = document.getElementById('bestseller-products');
const feedback = document.getElementById('home-feedback');

// Setup hero slider (Flipkart style promo carousel)
function initHeroSlider() {
  const carousel = document.querySelector('.hero-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const indicators = carousel.querySelectorAll('.indicator');
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');
  let currentIndex = 0;
  let intervalId;

  function showSlide(index) {
    slides[currentIndex].classList.remove('active');
    indicators[currentIndex].classList.remove('active');
    currentIndex = (index + slides.length) % slides.length;
    slides[currentIndex].classList.add('active');
    indicators[currentIndex].classList.add('active');
    if (track) {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function startAutoplay() {
    intervalId = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(intervalId);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAutoplay();
      showSlide(currentIndex - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAutoplay();
      showSlide(currentIndex + 1);
      startAutoplay();
    });
  }

  indicators.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      stopAutoplay();
      showSlide(i);
      startAutoplay();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  // Trigger reflow to animate the first slide content on load
  if (slides.length > 0) {
    slides[0].classList.remove('active');
    void slides[0].offsetWidth; // trigger reflow
    slides[0].classList.add('active');
  }

  startAutoplay();
}

// Setup product horizontal shelf scrolling
function initProductShelf() {
  const controls = document.querySelectorAll('.shelf-control');
  controls.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const shelf = document.getElementById(targetId);
      if (!shelf) return;
      
      const scrollAmount = btn.classList.contains('prev') ? -280 : 280;
      shelf.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  });
}

async function loadFeaturedProducts() {
  try {
    const products = await api.getProducts();
    
    // Row 1: Featured Collection (first 4 items)
    const featured = products.slice(0, 4);
    featuredProducts.innerHTML =
      featured.length > 0
        ? featured.map((product) => renderProductCard(product, { showQuickAdd: false })).join('')
        : renderEmptyState(
            'No products available',
            'We are updating our catalog. Please check back later!',
            'Go to Shop',
            './products.html'
          );

    // Row 2: Best Sellers (next 4 items)
    const bestsellers = products.slice(4, 8);
    if (bestsellerProducts) {
      bestsellerProducts.innerHTML =
        bestsellers.length > 0
          ? bestsellers.map((product) => renderProductCard(product, { showQuickAdd: false })).join('')
          : renderEmptyState(
              'No products available',
              'We are updating our catalog. Please check back later!',
              'Go to Shop',
              './products.html'
            );
    }
          
    if (featured.length > 0 || bestsellers.length > 0) {
      initProductShelf();
    }
  } catch (error) {
    showInlineMessage(
      feedback,
      error.message || 'Unable to load products right now.',
      'error'
    );
  }
}

// Setup mobile search bar listener
function initMobileSearch() {
  const mobileSearchInput = document.getElementById('home-mobile-search');
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = encodeURIComponent(mobileSearchInput.value.trim());
        window.location.href = `./products.html?search=${query}`;
      }
    });
  }
}

// Initialize on page load
initHeroSlider();
initMobileSearch();
loadFeaturedProducts();
