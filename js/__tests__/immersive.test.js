import {
  getScrollIntensity,
  initImmersiveInteractions,
  shouldUseCustomCursor,
} from '../immersive.js';

describe('Signal Trace interaction safeguards', () => {
  test('normalizes scroll velocity without exceeding the audio range', () => {
    expect(getScrollIntensity(0, 16)).toBe(0);
    expect(getScrollIntensity(24, 48)).toBeCloseTo(1 / 6);
    expect(getScrollIntensity(500, 16)).toBe(1);
  });

  test('only enables the custom cursor for fine pointers without reduced motion', () => {
    expect(shouldUseCustomCursor(true, false)).toBe(true);
    expect(shouldUseCustomCursor(false, false)).toBe(false);
    expect(shouldUseCustomCursor(true, true)).toBe(false);
  });

  test('creates an accessible, muted-by-default sound control', () => {
    document.querySelector('[data-mnxtr-sound]')?.remove();
    document.querySelector('.mnxtr-cursor')?.remove();
    document.documentElement.classList.remove('mnxtr-custom-cursor');

    const cleanup = initImmersiveInteractions();
    const toggle = document.querySelector('[data-mnxtr-sound]');

    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toHaveAttribute('aria-label', 'Enable interface sounds');
    expect(toggle).toHaveTextContent('SOUND');
    expect(toggle).toHaveTextContent('OFF');

    cleanup();
    expect(document.querySelector('[data-mnxtr-sound]')).not.toBeInTheDocument();
  });
});
