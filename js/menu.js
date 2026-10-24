export function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) {
    return;
  }
  toggle.hidden = false;
  toggle.closest('header')?.classList.add('nav-enhanced');
  const close = (restoreFocus = false) => {
    toggle.classList.remove('open');
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) {
      toggle.focus();
    }
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.classList.toggle('open', open);
    menu.classList.toggle('open', open);
  });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      close();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      close(true);
    }
  });
  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
      close();
    }
  });
  window.matchMedia?.('(min-width: 701px)').addEventListener?.('change', () => close());
}
