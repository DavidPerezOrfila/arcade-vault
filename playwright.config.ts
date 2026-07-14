import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  outputDir: '.playwright-screenshots',
  snapshotDir: '.playwright-screenshots/snapshots',
  fullyParallel: true,
  retries: 1,
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['html', { outputFolder: '.playwright-screenshots/report' }],
    ['list'],
  ],
});
