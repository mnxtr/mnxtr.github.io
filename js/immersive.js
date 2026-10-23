/**
 * MNXTR immersive interaction layer.
 *
 * Signal Trace adds a fine-pointer cursor and click feedback without external assets.
 */

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], summary, label[for], input[type="checkbox"], input[type="radio"]';
const NATIVE_CURSOR_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

/**
 * Decide whether the custom cursor should replace the native pointer.
 */
function shouldUseCustomCursor(hasFinePointer, prefersReducedMotion) {
  return hasFinePointer && !prefersReducedMotion;
}

function safeMediaQuery(query) {
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(query);
  }

  return {
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

function createInteractionElements() {
  const cursor = document.createElement('div');
  cursor.className = 'mnxtr-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `
    <span class="mnxtr-cursor-ring"></span>
    <span class="mnxtr-cursor-core"></span>
  `;

  document.body.append(cursor);
  return { cursor };
}

/**
 * Initialize Signal Trace. Returns a cleanup function for tests and page teardown.
 *
 * @returns {() => void} Cleanup function.
 */
function initImmersiveInteractions() {
  if (!document.body || document.querySelector('.mnxtr-cursor')) {
    return () => {};
  }

  const { cursor } = createInteractionElements();
  const cursorRing = cursor.querySelector('.mnxtr-cursor-ring');
  const cursorCore = cursor.querySelector('.mnxtr-cursor-core');
  const finePointerQuery = safeMediaQuery('(pointer: fine)');
  const reducedMotionQuery = safeMediaQuery('(prefers-reduced-motion: reduce)');

  let cursorEnabled = false;
  let cursorFrame = 0;
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  let targetX = ringX;
  let targetY = ringY;
  let cleanedUp = false;

  const animateCursor = () => {
    if (!cursorEnabled || cleanedUp) {
      cursorFrame = 0;
      return;
    }

    ringX += (targetX - ringX) * 0.2;
    ringY += (targetY - ringY) * 0.2;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    cursorFrame = window.requestAnimationFrame(animateCursor);
  };

  const syncCursorMode = () => {
    cursorEnabled = shouldUseCustomCursor(finePointerQuery.matches, reducedMotionQuery.matches);
    document.documentElement.classList.toggle('mnxtr-custom-cursor', cursorEnabled);
    cursor.classList.toggle('is-disabled', !cursorEnabled);

    if (cursorEnabled && !cursorFrame) {
      cursorFrame = window.requestAnimationFrame(animateCursor);
    } else if (!cursorEnabled && cursorFrame) {
      window.cancelAnimationFrame(cursorFrame);
      cursorFrame = 0;
    }
  };

  const onPointerMove = (event) => {
    if (!cursorEnabled || event.pointerType === 'touch') {
      return;
    }

    targetX = event.clientX;
    targetY = event.clientY;
    cursorCore.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    cursor.classList.add('is-visible');

    const target = typeof event.target?.closest === 'function' ? event.target : null;
    const isInteractive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
    const usesNativeCursor = Boolean(target?.closest(NATIVE_CURSOR_SELECTOR));
    cursor.classList.toggle('is-interactive', isInteractive);
    cursor.classList.toggle('is-native', usesNativeCursor);
  };

  const createClickRipple = (event) => {
    if (!cursorEnabled || event.pointerType === 'touch' || event.button !== 0) {
      return;
    }

    const ripple = document.createElement('span');
    ripple.className = 'mnxtr-click-ripple';
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    cursor.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    window.setTimeout(() => ripple.remove(), 650);
  };

  const onPointerDown = (event) => createClickRipple(event);

  const hideCursor = () => cursor.classList.remove('is-visible');
  const showCursor = () => cursor.classList.add('is-visible');
  const onPageHide = (event) => {
    if (!event.persisted) {
      cleanup();
    }
  };

  const addMediaListener = (query, handler) => {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
      return () => query.removeEventListener('change', handler);
    }

    query.addListener?.(handler);
    return () => query.removeListener?.(handler);
  };

  const removeFinePointerListener = addMediaListener(finePointerQuery, syncCursorMode);
  const removeReducedMotionListener = addMediaListener(reducedMotionQuery, syncCursorMode);

  syncCursorMode();
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.documentElement.addEventListener('mouseleave', hideCursor);
  document.documentElement.addEventListener('mouseenter', showCursor);
  window.addEventListener('pagehide', onPageHide);

  function cleanup() {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerdown', onPointerDown);
    document.documentElement.removeEventListener('mouseleave', hideCursor);
    document.documentElement.removeEventListener('mouseenter', showCursor);
    window.removeEventListener('pagehide', onPageHide);
    removeFinePointerListener();
    removeReducedMotionListener();

    if (cursorFrame) {
      window.cancelAnimationFrame(cursorFrame);
    }
    document.documentElement.classList.remove('mnxtr-custom-cursor');
    cursor.remove();
  }

  return cleanup;
}

function bootImmersiveInteractions() {
  initImmersiveInteractions();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootImmersiveInteractions, { once: true });
  } else {
    bootImmersiveInteractions();
  }
}

export { initImmersiveInteractions, shouldUseCustomCursor };
