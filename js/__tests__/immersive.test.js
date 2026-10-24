import { initImmersiveInteractions, shouldUseCustomCursor } from '../immersive.js';

describe('Signal Trace interaction safeguards', () => {
  test('only enables the custom cursor for fine pointers without reduced motion', () => {
    expect(shouldUseCustomCursor(true, false)).toBe(true);
    expect(shouldUseCustomCursor(false, false)).toBe(false);
    expect(shouldUseCustomCursor(true, true)).toBe(false);
  });

  test('creates and cleans up the custom cursor without a sound control', () => {
    document.querySelector('.mnxtr-cursor')?.remove();
    const cleanup = initImmersiveInteractions();
    expect(document.querySelector('.mnxtr-cursor')).toBeInTheDocument();
    expect(document.querySelector('[data-mnxtr-sound]')).not.toBeInTheDocument();
    cleanup();
    expect(document.querySelector('.mnxtr-cursor')).not.toBeInTheDocument();
  });
});
