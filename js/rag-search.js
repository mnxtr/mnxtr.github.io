const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'he',
  'his',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'of',
  'on',
  'or',
  'show',
  'that',
  'the',
  'this',
  'to',
  'what',
  'which',
  'with',
]);

const SYNONYM_GROUPS = [
  ['ai', 'artificial intelligence', 'machine learning', 'ml', 'neural network'],
  ['rag', 'retrieval augmented generation', 'llm', 'language model', 'semantic search'],
  ['backend', 'api', 'fastapi', 'server', 'rest', 'database'],
  ['frontend', 'interface', 'ui', 'react', 'javascript', 'html', 'css'],
  ['full stack', 'fullstack', 'frontend', 'backend', 'product engineering'],
  ['computer vision', 'vision', 'yolo', 'opencv', 'object detection', 'image recognition'],
  ['security', 'secure', 'authentication', 'authorization', 'jwt', 'oauth', 'hardening'],
  ['deployment', 'production', 'docker', 'cloud', 'ci cd', 'inference service'],
  ['real time', 'realtime', 'low latency', 'edge', 'embedded', 'mobile'],
  ['healthcare', 'medical', 'cardiovascular', 'ekg', 'health'],
  ['job', 'hire', 'employment', 'internship', 'opportunity', 'recruiter'],
  ['data', 'database', 'postgresql', 'dbms', 'relational'],
];

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value = '') {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function expandQuery(query) {
  const normalizedQuery = normalizeText(query);
  const expanded = new Set(tokenize(normalizedQuery));

  SYNONYM_GROUPS.forEach((group) => {
    const normalizedGroup = group.map(normalizeText);
    const isRelated = normalizedGroup.some(
      (term) => normalizedQuery.includes(term) || tokenize(term).some((token) => expanded.has(token)),
    );

    if (isRelated) {
      normalizedGroup.forEach((term) => tokenize(term).forEach((token) => expanded.add(token)));
    }
  });

  return {
    normalizedQuery,
    terms: [...expanded],
  };
}

function countMatches(text, terms) {
  const normalizedText = normalizeText(text);
  const textTokens = new Set(tokenize(normalizedText));

  return terms.reduce((score, term) => {
    if (textTokens.has(term)) return score + 1;
    if (term.length >= 4 && normalizedText.includes(term)) return score + 0.55;
    return score;
  }, 0);
}

function scoreDocument(document, query) {
  const { normalizedQuery, terms } = expandQuery(query);
  if (!terms.length) return 0;

  const title = normalizeText(document.title);
  const tags = normalizeText((document.tags || []).join(' '));
  const description = normalizeText(document.description);
  const content = normalizeText(document.content);
  const source = normalizeText(`${document.sourceType} ${document.sourceLabel}`);

  let score = 0;

  if (title.includes(normalizedQuery)) score += 18;
  if (tags.includes(normalizedQuery)) score += 12;
  if (description.includes(normalizedQuery)) score += 8;
  if (content.includes(normalizedQuery)) score += 5;

  score += countMatches(title, terms) * 5;
  score += countMatches(tags, terms) * 4;
  score += countMatches(description, terms) * 2.5;
  score += countMatches(content, terms) * 1.25;
  score += countMatches(source, terms) * 1.5;

  const coverageFields = [title, tags, description, content].filter((field) =>
    terms.some((term) => field.includes(term)),
  ).length;
  score += coverageFields * 1.5;

  return Number(score.toFixed(2));
}

function confidenceLabel(score) {
  if (score >= 24) return 'Strong match';
  if (score >= 13) return 'Relevant match';
  return 'Possible match';
}

function defaultIndexUrl() {
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL('data/portfolio-index.json', document.baseURI);
  }

  return 'data/portfolio-index.json';
}

async function loadPortfolioIndex(indexUrl = defaultIndexUrl()) {
  const response = await fetch(indexUrl);
  if (!response.ok) {
    throw new Error(`Unable to load portfolio index (${response.status})`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.documents)) {
    throw new TypeError('Portfolio index is missing a documents array.');
  }

  return payload.documents;
}

function searchPortfolio(documents, query, { limit = 6, minimumScore = 3 } = {}) {
  if (!Array.isArray(documents) || !query.trim()) return [];

  return documents
    .map((document) => ({
      ...document,
      score: scoreDocument(document, query),
    }))
    .filter((document) => document.score >= minimumScore)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit)
    .map((document) => ({
      ...document,
      confidence: confidenceLabel(document.score),
    }));
}

function createPortfolioRetriever(options = {}) {
  let documents = [];
  let status = 'loading';
  let loadError = null;

  const ready = loadPortfolioIndex(options.indexUrl)
    .then((loadedDocuments) => {
      documents = loadedDocuments;
      status = 'ready';
      return documents;
    })
    .catch((error) => {
      status = 'error';
      loadError = error;
      throw error;
    });

  return {
    ready,
    get status() {
      return status;
    },
    get error() {
      return loadError;
    },
    search(query, searchOptions) {
      return searchPortfolio(documents, query, searchOptions);
    },
  };
}

export {
  createPortfolioRetriever,
  expandQuery,
  loadPortfolioIndex,
  normalizeText,
  scoreDocument,
  searchPortfolio,
  tokenize,
};
