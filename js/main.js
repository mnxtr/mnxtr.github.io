import { initTheme } from './theme.js';
import { initMobileMenu } from './menu.js';
import { initScrollProgress } from './scroll-reveal.js';
import { initCommandPalette } from './search.js';
import { initProjectBrief } from './contact.js';

export function shouldEnableThreeScenes() {
  return (
    window.matchMedia('(min-width: 901px)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !navigator.connection?.saveData
  );
}
export function initPortfolio() {
  initTheme();
  initMobileMenu();
  initScrollProgress();
  initCommandPalette();
  initProjectBrief();
  document.querySelectorAll('.site-nav a').forEach((link) => {
    if (
      new URL(link.href).pathname === window.location.pathname &&
      !link.hash &&
      window.location.pathname !== '/'
    ) {
      link.setAttribute('aria-current', 'page');
    }
  });
  document.querySelectorAll('.category-btn').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.category === 'all'));
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      document
        .querySelectorAll('.category-btn')
        .forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      document.querySelectorAll('.blog-card').forEach((card) => {
        card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category);
      });
    });
  });
  const scene = document.getElementById('workflow-scene');
  if (scene && shouldEnableThreeScenes()) {
    const load = () => {
      if (shouldEnableThreeScenes()) {
        import('./hero-scene.js')
          .then(({ initHeroScene }) => initHeroScene(scene))
          .catch(() => {
            /* Static workflow remains visible. */
          });
      }
    };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load, { timeout: 3000 });
    } else {
      setTimeout(load, 1000);
    }
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
