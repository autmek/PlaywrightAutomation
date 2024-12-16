const { defineConfig } = require('@playwright/test');
const commonSettings = {
  headless: process.env.CI ? true : true,
  trace: 'on',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  viewport: { width: 1280, height: 720 },
};
module.exports = defineConfig({
  testDir: './StoreFrog_App',
  timeout: 5 * 60 * 1000,
  expect: { timeout: 15 * 1000 },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html'],
    //['allure-playwright'],
  ],

  projects: [
    { name: 'Headless_Run', // Name of the project
      use: {
        ...commonSettings,
        browserName: 'firefox',
      },},
    { name: 'Headed_Run', // Name of the project
      use: {
        ...commonSettings,
        browserName: 'chromium',
      },},
  ],
});
