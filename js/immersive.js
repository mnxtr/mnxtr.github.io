/**
 * MNXTR immersive interaction layer.
 *
 * Signal Trace adds a fine-pointer cursor, click feedback, and opt-in Web Audio
 * cues without external assets. Every feature has a native, silent fallback.
 */

const SOUND_STORAGE_KEY = 'mnxtr-interface-sound';
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], summary, label[for], input[type="checkbox"], input[type="radio"]';
const NATIVE_CURSOR_SELECTOR = 'input, textarea, select, [contenteditable="true"]';

/**
 * Convert scroll distance and time into a stable 0..1 control value.
 *
 * @param {number} delta Distance travelled in CSS pixels.
 * @param {number} elapsed Time since the previous sample in milliseconds.
 * @returns {number} Normalized intensity.
 */
function getScrollIntensity(delta, elapsed) {
  const velocity = Math.abs(delta) / Math.max(elapsed, 16);
  return Math.min(1, velocity / 3);
}

/**
 * Decide whether the custom cursor should replace the native pointer.
 *
 * @param {boolean} hasFinePointer Whether the primary pointer is precise.
 * @param {boolean} prefersReducedMotion Whether motion reduction is requested.
 * @returns {boolean} Whether Signal Trace should be visible.
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

function readSoundPreference() {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

function writeSoundPreference(enabled) {
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // Storage may be unavailable in private browsing; the current session still works.
  }
}

function createInteractionElements() {
  const cursor = document.createElement('div');
  cursor.className = 'mnxtr-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `
    <span class="mnxtr-cursor-ring"></span>
    <span class="mnxtr-cursor-core"></span>
  `;

  const soundToggle = document.createElement('button');
  soundToggle.type = 'button';
  soundToggle.className = 'mnxtr-sound-toggle';
  soundToggle.setAttribute('data-mnxtr-sound', '');
  soundToggle.innerHTML = `
    <span class="mnxtr-sound-led" aria-hidden="true"></span>
    <span class="mnxtr-sound-label">SOUND</span>
    <span class="mnxtr-sound-state" aria-hidden="true">OFF</span>
  `;

  document.body.append(cursor, soundToggle);
  return { cursor, soundToggle };
}

/**
 * Initialize Signal Trace. Returns a cleanup function for tests and page teardown.
 *
 * @returns {() => void} Cleanup function.
 */
function initImmersiveInteractions() {
  if (!document.body || document.querySelector('[data-mnxtr-sound]')) {
    return () => {};
  }

  const { cursor, soundToggle } = createInteractionElements();
  const cursorRing = cursor.querySelector('.mnxtr-cursor-ring');
  const cursorCore = cursor.querySelector('.mnxtr-cursor-core');
  const soundState = soundToggle.querySelector('.mnxtr-sound-state');
  const finePointerQuery = safeMediaQuery('(pointer: fine)');
  const reducedMotionQuery = safeMediaQuery('(prefers-reduced-motion: reduce)');

  let cursorEnabled = false;
  let cursorFrame = 0;
  let scrollFrame = 0;
  let ringX = window.innerWidth / 2;
  let ringY = window.innerHeight / 2;
  let targetX = ringX;
  let targetY = ringY;
  let lastScrollY = window.scrollY;
  let lastScrollTime = Date.now();
  let lastSoundAt = 0;
  let audioContext = null;
  let soundEnabled = readSoundPreference();
  let cleanedUp = false;

  const updateSoundToggle = () => {
    soundToggle.classList.toggle('is-on', soundEnabled);
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundToggle.setAttribute(
      'aria-label',
      soundEnabled ? 'Disable interface sounds' : 'Enable interface sounds',
    );
    soundState.textContent = soundEnabled ? 'ON' : 'OFF';
  };

  const ensureAudioContext = async () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      soundToggle.disabled = true;
      soundToggle.setAttribute('aria-label', 'Interface sounds are unavailable in this browser');
      soundState.textContent = 'N/A';
      return null;
    }

    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    return audioContext;
  };

  const playTone = (
    startFrequency,
    endFrequency,
    duration = 0.035,
    volume = 0.01,
    type = 'sine',
    minimumGap = 70,
  ) => {
    const nowMs = Date.now();
    if (
      !soundEnabled ||
      !audioContext ||
      audioContext.state !== 'running' ||
      nowMs - lastSoundAt < minimumGap
    ) {
      return;
    }

    lastSoundAt = nowMs;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
  };

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

  const onPointerDown = (event) => {
    createClickRipple(event);

    const target = typeof event.target?.closest === 'function' ? event.target : null;
    if (
      event.button === 0 &&
      !target?.closest('[data-mnxtr-sound]') &&
      !target?.closest(NATIVE_CURSOR_SELECTOR)
    ) {
      playTone(320, 510, 0.034, 0.009, 'triangle', 65);
    }
  };

  const onScroll = () => {
    if (scrollFrame) {
      return;
    }

    scrollFrame = window.requestAnimationFrame(() => {
      const now = Date.now();
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      const elapsed = now - lastScrollTime;
      const intensity = getScrollIntensity(delta, elapsed);

      if (Math.abs(delta) >= 4 && intensity > 0.035) {
        playTone(
          145 + intensity * 115,
          155 + intensity * 150,
          0.028,
          0.0035 + intensity * 0.005,
          'sine',
          150,
        );
      }

      lastScrollY = currentY;
      lastScrollTime = now;
      scrollFrame = 0;
    });
  };

  const onSoundToggle = async () => {
    if (soundEnabled) {
      soundEnabled = false;
      writeSoundPreference(false);
      updateSoundToggle();
      return;
    }

    const context = await ensureAudioContext();
    if (!context) {
      return;
    }

    soundEnabled = true;
    writeSoundPreference(true);
    updateSoundToggle();
    playTone(410, 690, 0.06, 0.012, 'sine', 0);
  };

  const primeRememberedSound = () => {
    if (soundEnabled && !audioContext) {
      void ensureAudioContext();
    }
  };

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

  updateSoundToggle();
  syncCursorMode();
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointerup', primeRememberedSound, { once: true, passive: true });
  document.addEventListener('keyup', primeRememberedSound, { once: true });
  document.documentElement.addEventListener('mouseleave', hideCursor);
  document.documentElement.addEventListener('mouseenter', showCursor);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('pagehide', onPageHide);
  soundToggle.addEventListener('click', onSoundToggle);

  function cleanup() {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('pointerup', primeRememberedSound);
    document.removeEventListener('keyup', primeRememberedSound);
    document.documentElement.removeEventListener('mouseleave', hideCursor);
    document.documentElement.removeEventListener('mouseenter', showCursor);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pagehide', onPageHide);
    soundToggle.removeEventListener('click', onSoundToggle);
    removeFinePointerListener();
    removeReducedMotionListener();

    if (cursorFrame) {
      window.cancelAnimationFrame(cursorFrame);
    }
    if (scrollFrame) {
      window.cancelAnimationFrame(scrollFrame);
    }
    if (audioContext && audioContext.state !== 'closed') {
      void audioContext.close();
    }

    document.documentElement.classList.remove('mnxtr-custom-cursor');
    cursor.remove();
    soundToggle.remove();
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

export { getScrollIntensity, initImmersiveInteractions, shouldUseCustomCursor };
