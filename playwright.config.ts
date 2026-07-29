import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: '.playwright-output',
  snapshotDir: '.playwright-output/snapshots',
  fullyParallel: true,
  retries: 1,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [
    ['html', { outputFolder: '.playwright-report' }],
    ['list']
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    env: {
      RESEND_API_KEY: 'test',
      RESEND_FROM_EMAIL: 'test@arcade-vault.gg',
      CONTACT_EMAIL: 'test@arcade-vault.gg'
    }
  }
});
