const { test, expect } = require('../../fixtures/fixtures');
const { ChatPage } = require('../../pages/ChatPage');
const { CHAT_MESSAGES, GUARDRAIL_INPUTS } = require('../../data/testData');

test.describe('GovMurshid Chat UI', () => {

  let chatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    await chatPage.goto();
  });

  // ── Page Structure ───────────────────────────────────────
  test.describe('Page structure', () => {

    test('header is visible with correct branding', async () => {
      expect(await chatPage.header.isVisible()).toBe(true);
      const title = await chatPage.header.getTitle();
      expect(title).toContain('GovMurshid');
      const subtitle = await chatPage.header.getSubtitle();
      expect(subtitle).toContain('UAE');
    });

    test('welcome message is shown on load', async ({ page }) => {
      const welcome = await chatPage.messages.getAssistantMessages().first();
      await expect(welcome).toBeVisible();
      await expect(welcome).toContainText('GovMurshid');
    });

    test('input bar is visible and enabled', async () => {
      expect(await chatPage.input.isInputVisible()).toBe(true);
      expect(await chatPage.input.isSendButtonDisabled()).toBe(false);
    });

    test('suggestion buttons are present', async () => {
      const count = await chatPage.input.getSuggestionCount();
      expect(count).toBeGreaterThanOrEqual(5);
    });

  });

  // ── Chat Interactions ────────────────────────────────────
  test.describe('Chat interactions', () => {

    test('user message appears after sending', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.drivingLicense);
      const userMsg = chatPage.messages.getUserMessages().first();
      await expect(userMsg).toContainText('driving license');
    });

    test('assistant replies to driving license question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.drivingLicense);
      await expect(reply).toBeVisible({ timeout: 30000 });
      await expect(reply).not.toContainText('Could not reach');
    });

    test('RAG tag appears on policy answer', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.emiratesId);
      const tag = await chatPage.messages.waitForRagTag();
      await expect(tag).toBeVisible();
    });

    test('Enter key sends message', async ({ page }) => {
      await chatPage.input.sendWithEnter(CHAT_MESSAGES.trafficFines);
      const userMsg = chatPage.messages.getUserMessages().first();
      await expect(userMsg).toContainText('traffic fines');
    });

    test('suggestion button sends predefined message', async ({ page }) => {
      await chatPage.input.clickSuggestion(0);
      const userMsg = chatPage.messages.getUserMessages().first();
      await expect(userMsg).toBeVisible();
      await expect(userMsg).not.toBeEmpty();
    });

  });

  // ── UAE Service Categories ───────────────────────────────
  test.describe('UAE service categories', () => {

    test('answers Ejari housing question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.housing);
      await expect(reply).toBeVisible({ timeout: 30000 });
    });

    test('answers Dubai health insurance question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.healthcare);
      await expect(reply).toBeVisible({ timeout: 30000 });
    });

    test('answers school enrollment question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.education);
      await expect(reply).toBeVisible({ timeout: 30000 });
    });

  });

  // ── Guardrails ───────────────────────────────────────────
  test.describe('Guardrails', () => {

    test('prompt injection shows blocked tag', async ({ page }) => {
      await chatPage.input.typeAndSend(GUARDRAIL_INPUTS.promptInjection[0]);
      const tag = await chatPage.messages.waitForBlockedTag();
      await expect(tag).toContainText('Guardrail');
    });

    test('off-topic request shows blocked tag', async ({ page }) => {
      await chatPage.input.typeAndSend(GUARDRAIL_INPUTS.offTopic[0]);
      const tag = await chatPage.messages.waitForBlockedTag();
      await expect(tag).toBeVisible();
    });

  });

});