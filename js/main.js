/**
 * Main JavaScript for Portfolio
 * Handles theme toggle, typewriter effect, mobile menu, scroll reveal,
 * command palette, and progressive visual enhancement.
 */

import '../styles.css';
import '../taste.css';
import { initTheme } from './theme.js';
import { initMobileMenu } from './menu.js';
import { initScrollNavigation, initScrollProgress, initScrollReveal } from './scroll-reveal.js';
import { initTypewriter } from './typewriter.js';
import { initThreeScenes } from './three-scene.js';

// Command Palette
const commandItems = [
  { title: 'Home', description: 'Return to the top of the homepage', url: 'index.html' },
  {
    title: 'Expertise',
    description: 'Frontend, backend, data, and practical AI capabilities',
    url: '#expertise-heading',
  },
  {
    title: 'Selected Work',
    description: 'Open the three featured project case studies',
    url: '#work-heading',
  },
  {
    title: 'Core Stack',
    description: 'See the tools used to ship end-to-end web products',
    url: '#stack-heading',
  },
  {
    title: 'Engineering Focus',
    description: 'See the current architecture, backend, and AI focus areas',
    url: '#current-heading',
  },
  {
    title: 'Start a Project',
    description: 'Jump to the next-step collaboration call to action',
    url: '#articles-heading',
  },
  { title: 'Projects', description: 'Browse the full project archive', url: 'project.html' },
  { title: 'Resume', description: 'View experience, skills, and credentials', url: 'resume.html' },
  {
    title: 'Resume PDF',
    description: 'Open the one-page ATS-friendly resume',
    url: 'mohammad-mansib-newaz-resume.pdf',
  },
  {
    title: 'Contact',
    description: 'Start a collaboration or hiring conversation',
    url: 'contact.html',
  },
  {
    title: 'Deploying ML Models with FastAPI',
    description: 'Article · AI/ML · 15 min read',
    url: '/blog/posts/fastapi-ml-deployment.html',
  },
  {
    title: 'Building Secure FastAPI Applications',
    description: 'Article · Backend security · 12 min read',
    url: '/blog/posts/secure-fastapi.html',
  },
  {
    title: 'Full-Stack AI Integration',
    description: 'Article · Web product with an AI feature',
    url: '/blog/posts/full-stack-ai.html',
  },
];

function initCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('commandSearch');
  const results = document.getElementById('commandResults');
  const openers = document.querySelectorAll('[data-command-open]');
  const closers = document.querySelectorAll('[data-command-close]');
  if (!palette || !input || !results) {
    return;
  }

  let filteredItems = [...commandItems];
  let activeIndex = 0;

  const navigateToCommand = (item) => {
    close();
    window.location.href = item.url;
  };

  const render = () => {
    results.innerHTML = '';
    if (!filteredItems.length) {
      const empty = document.createElement('p');
      empty.className = 'command-item';
      empty.textContent = 'No matching commands.';
      results.appendChild(empty);
      return;
    }

    filteredItems.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `command-item${index === activeIndex ? ' active' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === activeIndex));
      button.innerHTML = `<strong>${item.title}</strong><span>${item.description}</span>`;
      button.addEventListener('click', () => navigateToCommand(item));
      results.appendChild(button);
    });
  };

  const filter = () => {
    const query = input.value.trim().toLowerCase();
    filteredItems = commandItems.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(query),
    );
    activeIndex = 0;
    render();
  };

  function open() {
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    input.value = '';
    filter();
    requestAnimationFrame(() => input.focus());
  }

  function close() {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openers.forEach((opener) => opener.addEventListener('click', open));
  closers.forEach((closer) => closer.addEventListener('click', close));
  input.addEventListener('input', filter);

  document.addEventListener('keydown', (event) => {
    const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (isShortcut) {
      event.preventDefault();
      open();
      return;
    }

    if (!palette.classList.contains('open')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filteredItems.length - 1);
      render();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
      return;
    }

    if (event.key === 'Enter' && filteredItems[activeIndex]) {
      event.preventDefault();
      navigateToCommand(filteredItems[activeIndex]);
    }
  });

  render();
}

function shouldEnableThreeScenes() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactViewport = window.matchMedia('(max-width: 620px)').matches;
  return !prefersReducedMotion && !compactViewport;
}

/**
 * Initialize all portfolio features
 */
function initPortfolio() {
  try {
    // Initialize theme
    initTheme();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize scroll reveal animations
    initScrollReveal();
    initScrollProgress();
    initScrollNavigation();

    // Initialize command palette
    initCommandPalette();

    // Treat Three.js as progressive enhancement, not required content.
    if (shouldEnableThreeScenes()) {
      initThreeScenes();
    }
  } catch (error) {
    console.error('Error initializing portfolio:', error);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

// Start typewriter after full page load
window.addEventListener('load', () => {
  try {
    const typewriterEl = document.getElementById('typewriter');
    if (!typewriterEl) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      typewriterEl.textContent = 'React · FastAPI · PostgreSQL · Practical AI.';
      return;
    }

    const typeWriter = initTypewriter(
      typewriterEl,
      window.typewriterPhrases || [
        'Building Complete Web Products.',
        'React · JavaScript · Responsive UI.',
        'FastAPI · PostgreSQL · Secure APIs.',
        'Practical AI Integration.',
      ],
    );

    if (typeWriter) {
      setTimeout(typeWriter, 500);
    }
  } catch (error) {
    console.error('Error starting typewriter:', error);
  }
});

// Export for testing
export { initPortfolio, initCommandPalette, shouldEnableThreeScenes };
