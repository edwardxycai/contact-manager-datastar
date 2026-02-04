import { defineConfig, device } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  testIgnore: [
    '**/*.test.js',
    '**/backend_api.test.js'
  ],

  reporter: [['html', { open: 'never' }]],

  timeout: 30 * 1000,

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'node server.js',
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        baseURL: 'http://localhost:3000',
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],  
});
