// Playwright fixtures — dependency injection for tests
// Instead of creating API client in every test, we inject it automatically

const { test: base } = require('@playwright/test');
const { GovAssistApiClient } = require('../api/GovAssistApiClient');

// Extend base test with our custom fixtures
const test = base.extend({
  // Inject API client into every test that needs it
  api: async ({ request }, use) => {
    const client = new GovAssistApiClient(request);
    await use(client);
  },

  // Inject a pre-navigated chat page
  chatPage: async ({ page }, use) => {
    await page.goto(process.env.BASE_URL || 'http://localhost:3000');
    await page.waitForSelector('.message.assistant');
    await use(page);
  }
});

const { expect } = base;

module.exports = { test, expect };