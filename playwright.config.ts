import { defineConfig } from '@playwright/test';
import * as path from 'path';

export default defineConfig({
  timeout: 30_000,
  retries: 0,
  workers: 1,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  projects: [
    {
      name: 'UI Tests',
      testDir: './tests',
      use: {
        baseURL:
          process.env.BASE_URL ??
          `file://${path.resolve(__dirname, 'emi-calculator.html')}`,
        screenshot: 'on',
        video: 'off',
        headless: true,
      },
    },
    {
      name: 'API Tests',
      testDir: './api-tests',
      use: {
        screenshot: 'off',
        video: 'off',
        headless: true,
      },
    },
  ],
});
