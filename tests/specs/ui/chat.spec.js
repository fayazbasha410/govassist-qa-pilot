// ─────────────────────────────────────────────────────────────────────────────
// TC_UI — Chat UI Tests
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('../../fixtures/fixtures');
const { ChatPage } = require('../../pages/ChatPage');
const { CHAT_MESSAGES, GUARDRAIL_INPUTS, EN, AR } = require('../../data/testData');
const { containsArabic } = require('../../helpers/testHelpers');

test.describe('GovMurshid Chat UI', () => {

  let chatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    await chatPage.goto();
  });

  // ── Page Structure ──────────────────────────────────────────────────────────
  test.describe('Page structure', () => {

    test('[TC_UI_001] header is visible with GovMurshid branding', async () => {
      expect(await chatPage.header.isVisible()).toBe(true);
      const title = await chatPage.header.getTitle();
      expect(title).toContain(EN.app_name);
    });

    test('[TC_UI_002] header subtitle contains UAE', async () => {
      const subtitle = await chatPage.header.getSubtitle();
      expect(subtitle).toContain(EN.app_subtitle);
    });

    test('[TC_UI_003] welcome message is shown on load', async ({ page }) => {
      const welcome = chatPage.messages.getAssistantMessages().first();
      await expect(welcome).toBeVisible();
      await expect(welcome).toContainText(EN.app_name);
    });

    test('[TC_UI_004] input bar is visible and enabled', async () => {
      expect(await chatPage.input.isInputVisible()).toBe(true);
      expect(await chatPage.input.isSendButtonDisabled()).toBe(false);
    });

    test('[TC_UI_005] at least 5 suggestion buttons are present', async () => {
      const count = await chatPage.input.getSuggestionCount();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('[TC_UI_006] New conversation button is visible', async ({ page }) => {
      const btn = page.locator('#new-chat-btn');
      await expect(btn).toBeVisible();
    });

    test('[TC_UI_007] footer contains developer name', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('Fayaz Basha Shaik');
    });

    test('[TC_UI_008] footer contains Proud of UAE', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toContainText('UAE');
    });

    test('[TC_UI_009] footer contains copyright', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toContainText('2026');
    });


  });

  // ── Chat Interactions ────────────────────────────────────────────────────────
  test.describe('Chat interactions', () => {

    test('[TC_UI_010] user message appears after sending', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.drivingLicense);
      const userMsg = chatPage.messages.getUserMessages().first();
      await expect(userMsg).toContainText(EN.driving_license);
    });

    test('[TC_UI_011] assistant replies to driving license question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.drivingLicense, 60000);
      await expect(reply).toBeVisible({ timeout: 60000 });
      await expect(reply).not.toContainText('Could not reach');
    });


    test('[TC_UI_012] RAG tag appears on policy answer', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.emiratesId);
      const tag = await chatPage.messages.waitForRagTag();
      await expect(tag).toBeVisible();
    });

    test('[TC_UI_013] Enter key sends message', async ({ page }) => {
      await chatPage.input.sendWithEnter(CHAT_MESSAGES.trafficFines);
      const userMsg = chatPage.messages.getUserMessages().first();
      await expect(userMsg).toBeVisible();
    });

    test('[TC_UI_014] suggestion button sends predefined message', async ({ page }) => {
      await chatPage.input.clickSuggestion(0);
      const userMsg = chatPage.messages.getUserMessages().first();
      await expect(userMsg).toBeVisible();
      await expect(userMsg).not.toBeEmpty();
    });

    test('[TC_UI_015] input clears after sending', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.drivingLicense);
      const inputValue = await page.locator('#user-input').inputValue();
      expect(inputValue).toBe('');
    });

    test('[TC_UI_016] tool tag appears for fine check', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.finePlate);
      const tag = page.locator('.tag.tool');
      await expect(tag).toBeVisible({ timeout: 15000 });
      await expect(tag).toContainText('checkFineStatus');
    });

    test('[TC_UI_017] memory badge appears after second message', async ({ page }) => {
      // Use tool calls (instant) instead of LLM calls to avoid timeout
      await chatPage.input.typeAndSend(CHAT_MESSAGES.finePlate);
      await page.locator('.tag.tool').waitFor({ state: 'visible', timeout: 10000 });
      await chatPage.input.typeAndSend(CHAT_MESSAGES.finePlateDubai);
      await page.locator('.tag.memory').waitFor({ state: 'visible', timeout: 10000 });
      const memoryTag = page.locator('.tag.memory');
      await expect(memoryTag).toBeVisible();
    }, { timeout: 30000 });    

  });

  // ── UAE Service Categories ───────────────────────────────────────────────────
  test.describe('UAE service categories', () => {

    test('[TC_UI_018] answers Ejari housing question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.housing);
      await expect(reply).toBeVisible({ timeout: 30000 });
      await expect(reply).toContainText(EN.ejari);
    });

    test('[TC_UI_019] answers Dubai health insurance question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.healthcare);
      await expect(reply).toBeVisible({ timeout: 30000 });
      await expect(reply).toContainText(EN.health_insurance);
    });

    test('[TC_UI_020] answers school enrollment question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.education);
      await expect(reply).toBeVisible({ timeout: 30000 });
      await expect(reply).toContainText(EN.school_enrollment);
    });

    test('[TC_UI_021] answers Sharjah health insurance question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.healthSharjah);
      await expect(reply).toBeVisible({ timeout: 30000 });
      await expect(reply).toContainText(EN.health_mandatory);
    });

    test('[TC_UI_022] answers Fujairah school enrollment question', async ({ page }) => {
      const reply = await chatPage.sendMessage(CHAT_MESSAGES.schoolFujairah);
      await expect(reply).toBeVisible({ timeout: 30000 });
      await expect(reply).toContainText(EN.school_moe);
    });

  });

  // ── Guardrails UI ────────────────────────────────────────────────────────────
  test.describe('Guardrails', () => {

    test('[TC_UI_023] prompt injection shows blocked tag', async ({ page }) => {
      await chatPage.input.typeAndSend(GUARDRAIL_INPUTS.promptInjection[0]);
      const tag = await chatPage.messages.waitForBlockedTag();
      await expect(tag).toContainText('Guardrail');
    });

    test('[TC_UI_024] off-topic request shows blocked tag', async ({ page }) => {
      await chatPage.input.typeAndSend(GUARDRAIL_INPUTS.offTopic[0]);
      const tag = await chatPage.messages.waitForBlockedTag();
      await expect(tag).toBeVisible();
    });

    test('[TC_UI_025] blocked message shows helpful redirect text', async ({ page }) => {
      await chatPage.input.typeAndSend(GUARDRAIL_INPUTS.offTopic[0]);
      const reply = chatPage.messages.getAssistantMessages().nth(1);
      await expect(reply).toBeVisible({ timeout: 10000 });
      await expect(reply).toContainText(EN.app_name);
    });

  });

  // ── Arabic Language UI ───────────────────────────────────────────────────────
  test.describe('Arabic language support', () => {

    test('[TC_UI_026] Arabic suggestion button sends Arabic message', async ({ page }) => {
      const arabicBtn = page.locator('.suggestion-btn').filter({ hasText: 'تجديد الرخصة' });
      await expect(arabicBtn).toBeVisible();
      await arabicBtn.click();
      const userMsg = chatPage.messages.getUserMessages().first();
      await expect(userMsg).toBeVisible();
      const text = await userMsg.innerText();
      expect(containsArabic(text)).toBe(true);
    });

    test('[TC_UI_027] Arabic driving license question gets Arabic reply', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.arabicDrivingLicense);
      const reply = await chatPage.messages.getLastAssistantMessage(90000);
      await expect(reply).toBeVisible();
      const text = await reply.innerText();
      expect(containsArabic(text)).toBe(true);
    }, { timeout: 120000 });    

    test('[TC_UI_028] Arabic health insurance reply renders without breaking layout', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.arabicHealthInsurance);
      const reply = await chatPage.messages.getLastAssistantMessage(40000);
      await expect(reply).toBeVisible();
      await expect(reply).not.toContainText('Could not reach');
    });

    test('[TC_UI_029] Arabic school enrollment Dubai returns Arabic reply', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.arabicSchoolDubai);
      const reply = await chatPage.messages.getLastAssistantMessage(40000);
      await expect(reply).toBeVisible();
      const text = await reply.innerText();
      expect(containsArabic(text)).toBe(true);
    });

  });

  // ── New Conversation ─────────────────────────────────────────────────────────
  test.describe('New conversation', () => {

    test('[TC_UI_030] New conversation button clears chat', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.finePlate);
      await page.locator('.tag.tool').waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('#new-chat-btn').click();
      await page.waitForTimeout(500);
      const messages = chatPage.messages.getAssistantMessages();
      const count = await messages.count();
      expect(count).toBe(1);
    }, { timeout: 30000 });

    test('[TC_UI_031] New conversation shows fresh welcome message', async ({ page }) => {
      await chatPage.input.typeAndSend(CHAT_MESSAGES.finePlate);
      await page.locator('.tag.tool').waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('#new-chat-btn').click();
      await page.waitForTimeout(500);
      const welcome = chatPage.messages.getAssistantMessages().first();
      await expect(welcome).toContainText(EN.app_name);
    }, { timeout: 30000 });


  });

});