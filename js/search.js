import { createPortfolioRetriever } from './rag-search.js';
const navigation = [
  {
    title: 'AI and automation services',
    description: 'Workflow automation, knowledge assistants, and integrations.',
    url: '/#services',
  },
  {
    title: 'Project case studies',
    description: 'Inspect implementation evidence and limitations.',
    url: '/project.html',
  },
  {
    title: 'Send a project brief',
    description: 'Describe the workflow you want to improve.',
    url: '/contact.html',
  },
  {
    title: 'About Mohammad Mansib Newaz',
    description: 'Approach, interests, and background.',
    url: '/about.html',
  },
  {
    title: 'Engineering notes',
    description: 'APIs, databases, AI, and documentation.',
    url: '/blog/',
  },
  {
    title: 'Résumé',
    description: 'Experience, education, and a printable PDF.',
    url: '/resume.html',
  },
];
export function initCommandPalette() {
  const dialog = document.getElementById('commandPalette');
  if (!dialog || typeof dialog.showModal !== 'function') {
    return;
  }
  const input = document.getElementById('commandSearch');
  const list = document.getElementById('commandResults');
  const status = document.getElementById('search-status');
  let retriever;
  let opener;
  const render = () => {
    const query = input.value.trim();
    const fallback = navigation.filter((item) =>
      `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
    );
    const results = query && retriever?.status === 'ready' ? retriever.search(query) : fallback;
    list.replaceChildren();
    for (const item of results) {
      const url = new URL(item.url, window.location.origin);
      if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol)) {
        continue;
      }
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = url.href;
      link.textContent = item.title;
      const description = document.createElement('span');
      description.textContent = item.description;
      link.append(description);
      li.append(link);
      list.append(li);
    }
    const count = list.children.length;
    status.textContent =
      retriever?.status === 'error'
        ? 'Project search is unavailable. Navigation results are still available.'
        : query && retriever?.status === 'loading'
          ? 'Loading the project index… Navigation is available below.'
          : count
            ? `${count} ${query ? 'matching' : 'suggested'} results.`
            : 'No matching results. Try “automation”, “vision”, or “contact”.';
  };
  const open = (button) => {
    if (dialog.open) {
      return;
    }
    opener = button || document.activeElement;
    dialog.showModal();
    input.focus();
    if (!retriever) {
      retriever = createPortfolioRetriever({ indexUrl: '/data/portfolio-index.json' });
      retriever.ready.then(render).catch(render);
    }
    render();
  };
  document.querySelectorAll('[data-open-search]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => open(button));
  });
  dialog.querySelector('[data-close-search]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    input.value = '';
    opener?.focus();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        dialog.close();
      }
    }
    if (event.target.closest('#commandResults a')) {
      dialog.close();
    }
  });
  input.addEventListener('input', render);
  document.addEventListener('keydown', (event) => {
    const editable = event.target.closest('input, textarea, select, [contenteditable="true"]');
    if (
      !editable &&
      (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'))
    ) {
      event.preventDefault();
      open();
    }
  });
}
