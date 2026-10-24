import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { sourcePages } from '../scripts/html.mjs';
const primaryPages = [
  '/',
  '/project.html',
  '/contact.html',
  '/about.html',
  '/resume.html',
  '/blog/',
  '/projects/traffic-sign-detection.html',
];
const auditedPages = sourcePages().map((file) => `/${file}`);
// Every test blocks the real contact service. No inquiry is sent during validation.
test.beforeEach(async ({ page }) => {
  await page.route('https://formsubmit.co/**', (route) => route.abort());
  await page.route('https://api.github.com/advisories**', (route) => route.fulfill({ json: [] }));
  await page.route('https://www.cisa.gov/**', (route) =>
    route.fulfill({ json: { vulnerabilities: [] } }),
  );
});
for (const width of [320, 390, 768, 1440]) {
  for (const theme of ['dark', 'light']) {
    test(`layout at ${width}px in ${theme} theme`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      for (const path of primaryPages) {
        await page.goto(path);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('.site-header')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          path,
        ).toBe(true);
        expect(await page.locator('html').evaluate((el) => el.classList.contains('light'))).toBe(
          theme === 'light',
        );
      }
    });
  }
}
for (const theme of ['dark', 'light']) {
  for (const path of auditedPages) {
    test(`accessibility: ${theme} ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
      await page.goto(path);
      const scan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(scan.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
    });
  }
}
test('mobile hero action is visible and optional 3D is not downloaded', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  const cta = page.locator('.hero .button');
  const bounds = await cta.boundingBox();
  expect(bounds.y + bounds.height).toBeLessThan(844);
  await page.waitForTimeout(1200);
  expect(requests.some((url) => /\/assets\/(three-|hero-scene-)/.test(url))).toBe(false);
  await expect(page.locator('canvas')).toHaveCount(0);
});
test('reduced motion excludes 3D even on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await page.waitForTimeout(1200);
  expect(requests.some((url) => /\/assets\/(three-|hero-scene-)/.test(url))).toBe(false);
  await expect(page.locator('canvas')).toHaveCount(0);
});
test('mobile menu closes on navigation and restores focus on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.locator('#menuToggle');
  await toggle.click();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Services' })
    .click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
test('search works on nested routes and returns focus on Escape', async ({ page }) => {
  await page.goto('/projects/crm-interface.html');
  const opener = page.getByRole('button', { name: /^Search/ });
  await opener.click();
  await page.getByRole('searchbox').fill('automation');
  await expect(
    page.locator('#commandResults').getByRole('link', { name: /AI and automation services/ }),
  ).toBeVisible();
  const scan = await new AxeBuilder({ page }).analyze();
  expect(scan.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  await page.keyboard.press('Tab');
  await expect(page.locator('#commandResults a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
});
test('search has accessible empty and offline states', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^Search/ }).click();
  await page.getByRole('searchbox').fill('zzzxxyy');
  await expect(page.locator('#search-status')).toContainText('No matching results');
  await page.reload();
  await page.route('**/data/portfolio-index.json', (route) => route.abort());
  await page.getByRole('button', { name: /^Search/ }).click();
  await page.getByRole('searchbox').fill('brief');
  await expect(page.locator('#search-status')).toContainText('unavailable');
  await expect(
    page.locator('#commandResults').getByRole('link', { name: /Send a project brief/ }),
  ).toBeVisible();
});
test('no JavaScript leaves content, navigation, and native form usable', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.hero .button')).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Contact' }),
  ).toBeVisible();
  await expect(page.locator('body')).not.toContainText('M" />');
  await page.goto('http://127.0.0.1:4173/contact.html');
  await expect(page.locator('form')).toHaveAttribute('method', 'POST');
  await expect(page.locator('form')).toHaveAttribute(
    'action',
    'https://formsubmit.co/mohammad.newaz1@northsouth.edu',
  );
  await expect(page.getByRole('button', { name: /Send project brief/ })).toBeEnabled();
  await context.close();
});
async function fillBrief(page) {
  await page.goto('/contact.html');
  await page.getByLabel('Your name').fill('Test visitor');
  await page.getByLabel('Email address').fill('test@example.com');
  await page
    .getByLabel('Describe the workflow')
    .fill('A fictional test workflow. No real inquiry.');
}
test('brief requires valid input and prevents duplicate requests', async ({ page }) => {
  let requests = 0;
  await page.route('https://formsubmit.co/ajax/**', async (route) => {
    requests++;
    expect(route.request().postDataJSON()).toMatchObject({
      name: 'Test visitor',
      email: 'test@example.com',
    });
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ json: { success: 'true' } });
  });
  await page.goto('/contact.html');
  await page.getByRole('button', { name: /Send project brief/ }).click();
  expect(requests).toBe(0);
  await fillBrief(page);
  await page.getByRole('button', { name: /Send project brief/ }).click();
  await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
  await expect(page.locator('#brief-status')).toContainText('accepted by the contact service');
  await expect(page.getByRole('button', { name: 'Brief submitted' })).toBeDisabled();
  expect(requests).toBe(1);
});
for (const failure of ['server', 'network', 'rejected', 'timeout']) {
  test(`brief preserves entries after ${failure} failure`, async ({ page }) => {
    if (failure === 'timeout') await page.clock.install();
    await page.route('https://formsubmit.co/ajax/**', async (route) => {
      if (failure === 'network') return route.abort();
      if (failure === 'timeout') return;
      await route.fulfill({ status: failure === 'server' ? 500 : 200, json: { success: false } });
    });
    await fillBrief(page);
    await page.getByRole('button', { name: /Send project brief/ }).click();
    if (failure === 'timeout') await page.clock.fastForward(21000);
    await expect(page.locator('#brief-status')).toContainText('could not confirm');
    await expect(page.getByLabel('Describe the workflow')).toHaveValue(
      'A fictional test workflow. No real inquiry.',
    );
    await expect(page.getByRole('button', { name: 'Try sending again' })).toBeEnabled();
  });
}
test('200% text scaling reflows navigation and contact form', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1000 });
  for (const path of ['/', '/contact.html']) {
    await page.goto(path);
    await page.addStyleTag({ content: 'html { font-size: 200%; }' });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      path,
    ).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
  }
});
