const $ = (id) => document.getElementById(id);
const GH =
  'https://api.github.com/advisories?type=reviewed&per_page=100&sort=published&direction=desc';
const KEV = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
const feeds = { github: [], kev: [] };
const statuses = { github: '', kev: '' };
let loadedAt = {};
function validHttps(url, host) {
  try {
    const x = new URL(url);
    return x.protocol === 'https:' && (x.hostname === host || x.hostname.endsWith('.' + host));
  } catch {
    return false;
  }
}
function cell(text, tag = 'td') {
  const node = document.createElement(tag);
  node.textContent = text ?? '—';
  return node;
}
function when(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? '—'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
function toGitHub(a) {
  return {
    id: a.cve_id || a.ghsa_id || 'Unidentified',
    title: String(a.summary || 'Untitled advisory'),
    severity: String(a.severity || 'unknown').toLowerCase(),
    package:
      [
        ...new Set(
          (a.vulnerabilities || []).map((v) =>
            [v.package?.ecosystem, v.package?.name].filter(Boolean).join(' / '),
          ),
        ),
      ]
        .slice(0, 3)
        .join(', ') || 'Not specified',
    ecosystems: (a.vulnerabilities || []).map((v) => v.package?.ecosystem).filter(Boolean),
    date: a.published_at,
    url: validHttps(a.html_url, 'github.com') ? a.html_url : null,
  };
}
function toKEV(a) {
  return {
    id: a.cveID || 'Unidentified',
    title: String(a.vulnerabilityName || a.shortDescription || 'Untitled vulnerability'),
    severity: 'unknown',
    package: [a.vendorProject, a.product].filter(Boolean).join(' / ') || 'Not specified',
    ecosystems: [],
    date: a.dateAdded,
    url: /^CVE-\d{4}-\d{4,}$/.test(a.cveID || '')
      ? 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'
      : null,
  };
}
async function getJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
async function load(source) {
  if (statuses[source] === 'loading') return;
  statuses[source] = 'loading';
  $('refresh').disabled = true;
  $('stateLabel').textContent =
    'Loading ' + (source === 'github' ? 'GitHub advisories' : 'CISA KEV') + '…';
  render();
  try {
    const json = await getJson(source === 'github' ? GH : KEV);
    if (source === 'github') {
      if (!Array.isArray(json)) throw new Error('Unexpected API response');
      feeds.github = json.filter((a) => !a.withdrawn_at).map(toGitHub);
    } else {
      if (!Array.isArray(json.vulnerabilities)) throw new Error('Unexpected catalog response');
      feeds.kev = json.vulnerabilities
        .map(toKEV)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 100);
    }
    statuses[source] = 'ready';
    loadedAt[source] = new Date();
    $('stateLabel').textContent = 'Live feed loaded';
  } catch (error) {
    statuses[source] = 'error';
    $('stateLabel').textContent =
      'Feed unavailable — ' + (error.name === 'AbortError' ? 'timeout' : error.message);
  } finally {
    $('refresh').disabled = false;
    render();
  }
}
function render() {
  const source = $('source').value;
  const items = feeds[source];
  const query = $('search').value.trim().toLowerCase();
  const severity = $('severity').value;
  const ecosystem = $('ecosystem').value.toLowerCase();
  $('severity').disabled = source === 'kev';
  $('ecosystem').disabled = source === 'kev';
  $('feedLabel').textContent = source === 'github' ? 'GitHub' : 'CISA KEV';
  $('lastUpdated').textContent = loadedAt[source]
    ? 'Fetched ' + loadedAt[source].toLocaleTimeString()
    : 'Not yet fetched';
  $('total').textContent = feeds.github.length || '—';
  $('urgent').textContent = feeds.github.length
    ? feeds.github.filter((x) => ['critical', 'high'].includes(x.severity)).length
    : '—';
  $('kevTotal').textContent = feeds.kev.length || '—';
  const filtered = items.filter(
    (a) =>
      (!query || [a.id, a.title, a.package].join(' ').toLowerCase().includes(query)) &&
      (source === 'kev' ||
        ((!severity || a.severity === severity) &&
          (!ecosystem || a.ecosystems.includes(ecosystem)))),
  );
  const body = $('entries');
  body.replaceChildren();
  if (!filtered.length) {
    const row = document.createElement('tr'),
      td = cell(
        statuses[source] === 'error'
          ? 'Could not load the source. Try refreshing, or open the source catalog.'
          : statuses[source] === 'loading'
            ? 'Loading public advisories…'
            : 'No matching advisories in this fetched set.',
      );
    td.colSpan = 5;
    td.className = 'state';
    row.append(td);
    body.append(row);
  }
  for (const a of filtered) {
    const row = document.createElement('tr');
    const info = document.createElement('td');
    const strong = document.createElement('strong');
    strong.textContent = a.title;
    info.append(strong, cell(a.id, 'small'));
    const level = document.createElement('td'),
      badge = document.createElement('span');
    badge.className = 'severity ' + (a.severity === 'unknown' ? 'unknown' : a.severity);
    badge.textContent = a.severity === 'unknown' ? 'Not rated' : a.severity;
    level.append(badge);
    const ref = document.createElement('td');
    if (a.url) {
      const link = document.createElement('a');
      link.className = 'id';
      link.href = a.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'View source ↗';
      ref.append(link);
    } else ref.textContent = 'Unavailable';
    row.append(info, level, cell(a.package), cell(when(a.date)), ref);
    body.append(row);
  }
  $('resultCount').textContent =
    filtered.length +
    ' of ' +
    items.length +
    ' fetched entries displayed' +
    (statuses[source] === 'error' ? ' · API error' : '');
}
$('refresh').addEventListener('click', () => load($('source').value));
$('source').addEventListener('change', () => {
  render();
  if (!loadedAt[$('source').value]) load($('source').value);
});
for (const id of ['search', 'severity', 'ecosystem'])
  $(id).addEventListener(id === 'search' ? 'input' : 'change', render);
render();
load('github');
load('kev');
