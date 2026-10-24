function applyTheme(light) {
  document.documentElement.classList.toggle('light', light);
  document.body.classList.toggle('light', light);
  for (const id of ['themeToggle', 'themeToggleMobile']) {
    document
      .getElementById(id)
      ?.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
  }
  for (const id of ['sunIcon', 'sunIconMobile']) {
    document.getElementById(id)?.classList.toggle('hidden', !light);
  }
  for (const id of ['moonIcon', 'moonIconMobile']) {
    document.getElementById(id)?.classList.toggle('hidden', light);
  }
}
export function setupTheme(toggleId) {
  const button = document.getElementById(toggleId);
  if (!button) {
    return;
  }
  button.hidden = false;
  button.addEventListener('click', () => {
    const light = !document.body.classList.contains('light');
    applyTheme(light);
    try {
      localStorage.setItem('theme', light ? 'light' : 'dark');
    } catch {
      // A blocked storage API must not prevent theme changes.
    }
  });
}
export function initTheme() {
  let light = document.documentElement.classList.contains('light');
  try {
    light = localStorage.getItem('theme') === 'light';
  } catch {
    // Retain the initial theme when storage is unavailable.
  }
  applyTheme(light);
  setupTheme('themeToggle');
  setupTheme('themeToggleMobile');
}
