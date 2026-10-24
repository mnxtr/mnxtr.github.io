import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.goto(`${process.env.PORTFOLIO_PREVIEW_URL || 'http://127.0.0.1:4173'}/resume.html`, {
    waitUntil: 'networkidle',
  });
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.pdf({
    path: 'public/mohammad-mansib-newaz-resume.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' },
    tagged: true,
  });
  console.log('Exported the résumé from the current production preview.');
} finally {
  await browser.close();
}
