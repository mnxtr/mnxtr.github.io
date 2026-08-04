import { isSupabaseConfigured, supabase } from './supabase.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setStatus(form, message, kind = 'info') {
  const status = form.querySelector('[data-form-status]');
  if (!status) {
    return;
  }

  status.classList.remove('text-emerald-400', 'text-rose-400', 'text-gray-400');
  status.classList.add(
    kind === 'success' ? 'text-emerald-400' : kind === 'error' ? 'text-rose-400' : 'text-gray-400',
  );
  status.textContent = message;
}

function setSubmitting(form, submitting) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) {
    return;
  }

  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent.trim();
  }
  button.disabled = submitting;
  button.setAttribute('aria-busy', String(submitting));
  button.textContent = submitting ? 'Subscribing…' : button.dataset.defaultLabel;
}

function getValue(form, name) {
  return form.elements.namedItem(name)?.value.trim() || '';
}

async function submitNewsletter(form) {
  const email = getValue(form, 'email');

  if (!EMAIL_PATTERN.test(email)) {
    setStatus(form, 'Please enter a valid email address.', 'error');
    return;
  }

  if (!isSupabaseConfigured || !supabase) {
    setStatus(form, 'Newsletter signup is not configured yet. Please check back soon.', 'error');
    return;
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({
    email,
    source: window.location.pathname,
  });

  if (error?.code === '23505') {
    form.reset();
    setStatus(form, 'You’re already subscribed. Thanks for being here.', 'success');
    return;
  }

  if (error) {
    throw error;
  }

  form.reset();
  setStatus(form, 'You’re subscribed. Thanks for joining.', 'success');
}

function initSupabaseForms() {
  document.querySelectorAll('[data-supabase-form="newsletter"]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      setStatus(form, '');

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setSubmitting(form, true);
      try {
        await submitNewsletter(form);
      } catch (error) {
        console.error('Supabase newsletter signup failed:', error);
        setStatus(form, 'Something went wrong. Please try again later.', 'error');
      } finally {
        setSubmitting(form, false);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabaseForms);
} else {
  initSupabaseForms();
}

export { initSupabaseForms };
