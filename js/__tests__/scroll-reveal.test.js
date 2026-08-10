import { initScrollNavigation, initScrollProgress, initScrollReveal } from '../scroll-reveal.js';

describe('Scroll interaction modules', () => {
  let observerInstances;

  beforeEach(() => {
    observerInstances = [];
    document.body.innerHTML = `
      <div class="scroll-progress"><span></span></div>
      <div class="reveal"></div>
      <div class="reveal"></div>
      <nav class="desktop-nav">
        <a href="#one">One</a>
        <a href="#two">Two</a>
      </nav>
      <section id="one"></section>
      <section id="two"></section>
    `;

    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    window.requestAnimationFrame = jest.fn((callback) => {
      callback();
      return 1;
    });

    globalThis.IntersectionObserver = jest.fn().mockImplementation((callback) => {
      const instance = {
        callback,
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
      observerInstances.push(instance);
      return instance;
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.style.removeProperty('--scroll-progress');
    jest.restoreAllMocks();
  });

  test('reveals an intersecting element and stops observing it', () => {
    initScrollReveal();

    const reveals = document.querySelectorAll('.reveal');
    const observer = observerInstances[0];
    expect(observer.observe).toHaveBeenCalledTimes(2);

    observer.callback([{ isIntersecting: true, target: reveals[0] }]);

    expect(reveals[0]).toHaveClass('visible');
    expect(observer.unobserve).toHaveBeenCalledWith(reveals[0]);
  });

  test('shows all reveal elements when reduced motion is requested', () => {
    window.matchMedia.mockReturnValue({ matches: true });

    initScrollReveal();

    document.querySelectorAll('.reveal').forEach((element) => {
      expect(element).toHaveClass('visible');
    });
    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
  });

  test('uses a visible fallback when IntersectionObserver is unavailable', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.IntersectionObserver = undefined;

    initScrollReveal();

    document.querySelectorAll('.reveal').forEach((element) => {
      expect(element).toHaveClass('visible');
    });
    expect(warn).toHaveBeenCalledWith('IntersectionObserver not supported');
  });

  test('handles a page without reveal elements', () => {
    document.querySelectorAll('.reveal').forEach((element) => element.remove());

    expect(() => initScrollReveal()).not.toThrow();
    expect(globalThis.IntersectionObserver).not.toHaveBeenCalled();
  });

  test('calculates and updates scroll progress', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 500,
    });

    initScrollProgress();

    expect(document.documentElement.style.getPropertyValue('--scroll-progress')).toBe('0.5000');
    window.dispatchEvent(new window.Event('scroll'));
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  test('does nothing when the scroll progress element is absent', () => {
    document.querySelector('.scroll-progress').remove();
    expect(() => initScrollProgress()).not.toThrow();
  });

  test('marks the intersecting navigation section as current', () => {
    initScrollNavigation();

    const observer = observerInstances[0];
    const sections = document.querySelectorAll('section');
    const links = document.querySelectorAll('.desktop-nav a');
    expect(observer.observe).toHaveBeenCalledTimes(2);

    observer.callback([{ isIntersecting: true, target: sections[1] }]);

    expect(links[0]).not.toHaveClass('active');
    expect(links[0]).not.toHaveAttribute('aria-current');
    expect(links[1]).toHaveClass('active');
    expect(links[1]).toHaveAttribute('aria-current', 'location');
  });

  test('skips scroll navigation when IntersectionObserver is unavailable', () => {
    globalThis.IntersectionObserver = undefined;
    expect(() => initScrollNavigation()).not.toThrow();
  });
});
