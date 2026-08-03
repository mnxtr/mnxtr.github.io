/**
 * Scroll reveal animation module
 * Handles reveal animations for elements on scroll
 */

/**
 * Initialize scroll reveal animations using IntersectionObserver
 */
export function initScrollReveal() {
  try {
    const reveals = document.querySelectorAll('.reveal');

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      reveals.forEach((el) => el.classList.add('visible'));
      return;
    }

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('IntersectionObserver not supported');
      // Fallback: show all reveal elements immediately
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('visible');
      });
      return;
    }

    if (reveals.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' },
    );

    reveals.forEach((el) => observer.observe(el));
  } catch (error) {
    console.error('Error initializing scroll reveal:', error);
  }
}

/**
 * Paint the visitor's position through the document without intercepting native scrolling.
 */
export function initScrollProgress() {
  const progress = document.querySelector('.scroll-progress');
  if (!progress) {
    return;
  }

  let scheduled = false;
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    document.documentElement.style.setProperty('--scroll-progress', ratio.toFixed(4));
    scheduled = false;
  };
  const requestUpdate = () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
}

/**
 * Keeps section navigation oriented as visitors move through the portfolio.
 */
export function initScrollNavigation() {
  if (typeof IntersectionObserver === 'undefined') {
    return;
  }

  const links = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const pairs = links
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(({ section }) => section);
  if (!pairs.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        pairs.forEach(({ link, section }) => {
          const isCurrent = section === entry.target;
          link.classList.toggle('active', isCurrent);
          if (isCurrent) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    },
    { rootMargin: '-25% 0px -62% 0px', threshold: 0 },
  );

  pairs.forEach(({ section }) => observer.observe(section));
}
