// Playwright fixtures — dependency injection for tests
// Instead of creating API client in every test, we inject it automatically


const { test: base } = require('@playwright/test');
const { GovAssistApiClient } = require('../api/GovAssistApiClient');


// Extend base test with our custom fixtures
const test = base.extend({
  // Inject API client into every test that needs it.
  // AUDIT NOTE: every test gets its own unique defaultSessionId, built from
  // Playwright's own testId (stable per test) plus the retry attempt number
  // (so a retried test gets a clean session too, not the possibly-corrupted
  // one from its failed attempt). This is what prevents ~65+ existing
  // sendChat() calls across the suite from silently sharing the server's
  // single fallback 'default' session — see GovAssistApiClient.js for the
  // full explanation. Tests that explicitly pass their own sessionId (e.g.
  // TC_CHAT_006) are unaffected; an explicit argument always wins.
  api: async ({ request }, use, testInfo) => {
    const defaultSessionId = `pw_${testInfo.testId}_r${testInfo.retry}`;
    const client = new GovAssistApiClient(request, defaultSessionId);
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