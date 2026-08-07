import { rmSync } from 'node:fs';

// Jest generates HTML coverage reports that must never become public site pages.
rmSync('coverage', { recursive: true, force: true });
console.log('Removed test-only coverage artifacts before production build.');
