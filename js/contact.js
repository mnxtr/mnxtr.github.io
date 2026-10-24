export function initProjectBrief() {
  const form = document.getElementById('project-brief');
  if (!form || typeof fetch !== 'function' || typeof AbortController === 'undefined') {
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('brief-status');
  let pending = false;
  let submitted = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || submitted || !form.reportValidity()) {
      return;
    }
    pending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your project brief…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const endpoint = new URL(form.action);
      endpoint.pathname = `/ajax${endpoint.pathname}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || ![true, 'true'].includes(result.success)) {
        throw new Error('The contact service did not confirm acceptance.');
      }
      submitted = true;
      button.textContent = 'Brief submitted';
      status.textContent =
        'Your brief was accepted by the contact service. Thank you — I usually reply within 24–48 hours. If you don’t hear back, please email me directly.';
      status.focus();
    } catch {
      status.textContent =
        'We could not confirm that your brief was sent. Your entries are still here. You can try again or email me directly; a delayed request may still arrive.';
      button.textContent = 'Try sending again';
      status.focus();
    } finally {
      clearTimeout(timeout);
      pending = false;
      button.disabled = submitted;
      form.removeAttribute('aria-busy');
    }
  });
}
