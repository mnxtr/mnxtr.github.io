/**
 * Main JavaScript for Portfolio
 * Handles theme toggle, typewriter effect, mobile menu, scroll reveal, and portfolio retrieval.
 */

import '../styles.css';
import { initTheme } from './theme.js';
import { initMobileMenu } from './menu.js';
import { initScrollNavigation, initScrollProgress, initScrollReveal } from './scroll-reveal.js';
import { initTypewriter } from './typewriter.js';
import { initThreeScenes } from './three-scene.js';
import { createPortfolioRetriever } from './rag-search.js';

// Command Palette
const commandItems = [
  { title: 'Home', description: 'Return to the top of the homepage', url: 'index.html' },
  {
    title: 'Featured Traffic Sign Project',
    description: 'Open the flagship computer vision case study',
    url: '#work-heading',
  },
  {
    title: 'Currently Working On',
    description: 'See active AI engineering focus areas',
    url: '#current-heading',
  },
  {
    title: 'Latest Articles',
    description: 'Read recent FastAPI and AI engineering writing',
    url: '#articles-heading',
  },
  { title: 'Projects', description: 'Browse the full project archive', url: 'project.html' },
  { title: 'Resume', description: 'View experience, skills, and credentials', url: 'resume.html' },
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
    title: 'Full Stack AI Project',
    description: 'Article · Idea to production',
    url: '/blog/posts/full-stack-ai.html',
  },
];

function initCommandPalette() {
  const palette = document.getElementById('commandPalette');
  const input = document.getElementById('commandSearch');
  const results = document.getElementById('commandResults');
  const title = palette?.querySelector('.command-title');
  const hint = palette?.querySelector('.command-hint');
  const openers = document.querySelectorAll('[data-command-open]');
  const closers = document.querySelectorAll('[data-command-close]');
  if (!palette || !input || !results) {
    return;
  }

  const portfolioRetriever = createPortfolioRetriever();
  let filteredItems = commandItems.map((item) => ({ ...item, kind: 'navigation' }));
  let activeIndex = 0;
  let currentQuery = '';

  results.setAttribute('aria-live', 'polite');

  const navigateToCommand = (item) => {
    close();
    window.location.href = item.url;
  };

  const updateStatusText = () => {
    if (!currentQuery) {
      if (title) title.textContent = 'Navigate';
      if (hint) hint.textContent = 'Search the portfolio or use arrow keys and Enter.';
      return;
    }

    if (title) title.textContent = 'Portfolio retrieval';

    if (portfolioRetriever.status === 'loading') {
      if (hint) hint.textContent = 'Loading the portfolio knowledge index…';
    } else if (portfolioRetriever.status === 'error') {
      if (hint) hint.textContent = 'Knowledge search is unavailable; navigation search still works.';
    } else if (hint) {
      hint.textContent = `${filteredItems.length} relevant result${filteredItems.length === 1 ? '' : 's'} found.`;
    }
  };

  const render = () => {
    results.replaceChildren();
    updateStatusText();

    if (!filteredItems.length) {
      const empty = document.createElement('p');
      empty.className = 'command-item';
      empty.textContent = 'No supported portfolio evidence matched this search.';
      results.appendChild(empty);
      return;
    }

    filteredItems.forEach((item, index) => {
      const button = document.createElement('button');
      const itemTitle = document.createElement('strong');
      const itemDescription = document.createElement('span');

      button.type = 'button';
      button.className = `command-item${index === activeIndex ? ' active' : ''}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === activeIndex));
      button.dataset.resultType = item.kind;

      itemTitle.textContent = item.title;
      itemDescription.textContent =
        item.kind === 'knowledge'
          ? `${item.sourceLabel} · ${item.confidence} · ${item.description}`
          : item.description;

      button.append(itemTitle, itemDescription);
      button.addEventListener('click', () => navigateToCommand(item));
      results.appendChild(button);
    });
  };

  const filter = () => {
    currentQuery = input.value.trim();
    const normalizedQuery = currentQuery.toLowerCase();

    if (!currentQuery) {
      filteredItems = commandItems.map((item) => ({ ...item, kind: 'navigation' }));
      activeIndex = 0;
      render();
      return;
    }

    const navigationResults = commandItems
      .filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery))
      .map((item) => ({ ...item, kind: 'navigation' }));

    const knowledgeResults =
      portfolioRetriever.status === 'ready'
        ? portfolioRetriever.search(currentQuery).map((item) => ({
            ...item,
            kind: 'knowledge',
          }))
        : [];

    const knowledgeUrls = new Set(knowledgeResults.map((item) => item.url));
    filteredItems = [
      ...knowledgeResults,
      ...navigationResults.filter((item) => !knowledgeUrls.has(item.url)),
    ];

    activeIndex = 0;
    render();
  };

  function open() {
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    input.value = '';
    currentQuery = '';
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

  portfolioRetriever.ready
    .then(() => {
      if (currentQuery) filter();
    })
    .catch((error) => {
      console.warn('Portfolio retrieval index could not be loaded:', error);
      if (currentQuery) render();
    });

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

    if (event.key === 'ArrowDown' && filteredItems.length) {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filteredItems.length - 1);
      render();
      return;
    }

    if (event.key === 'ArrowUp' && filteredItems.length) {
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

    // Initialize command palette and portfolio retrieval
    initCommandPalette();

    // Initialize Three.js scenes
    initThreeScenes();
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
    if (typewriterEl) {
      const typeWriter = initTypewriter(
        typewriterEl,
        window.typewriterPhrases || [
          'Building Intelligent AI Systems.',
          'LLMs · RAG · Neural Networks.',
          'Full Stack Development.',
          'Python · FastAPI · PyTorch · React.',
        ],
      );

      if (typeWriter) {
        setTimeout(typeWriter, 500);
      }
    }
  } catch (error) {
    console.error('Error starting typewriter:', error);
  }
});

// Export for testing
export { initPortfolio, initCommandPalette };
