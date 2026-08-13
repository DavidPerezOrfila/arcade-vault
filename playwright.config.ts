import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: '.playwright-output',
  snapshotDir: '.playwright-output/snapshots',
  fullyParallel: false,
  retries: 1,
  timeout: 60000,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 60000,
  },
  reporter: [['html', { outputFolder: '.playwright-report' }], ['list']],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
    env: {
      RESEND_API_KEY: 'test',
      RESEND_FROM_EMAIL: 'test@arcade-vault.gg',
      CONTACT_EMAIL: 'test@arcade-vault.gg',
    },
  },
});
