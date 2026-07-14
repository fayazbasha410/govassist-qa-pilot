const { test, expect } = require('../../fixtures/fixtures');
const { GUARDRAIL_INPUTS, CHAT_MESSAGES } = require('../../data/testData');
const { assertChatResponseSchema } = require('../../helpers/testHelpers');

test.describe('Chat API', () => {

  test('returns 400 for missing message', async ({ api }) => {
    const { status } = await api.sendChatRaw({});
    expect(status).toBe(400);
  });

  test('returns 400 for non-string message', async ({ api }) => {
    const { status } = await api.sendChatRaw({ message: 123 });
    expect(status).toBe(400);
  });

  test('response always matches schema', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicense);
    assertChatResponseSchema(body);
  });

  test('policy question returns retrieved docs', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicense);
    expect(body.guardrail.triggered).toBe(false);
    expect(body.retrievedDocs.length).toBeGreaterThan(0);
  });

  test('Ejari question returns housing docs', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.housing);
    expect(body.guardrail.triggered).toBe(false);
    expect(body.reply.length).toBeGreaterThan(0);
  });

  test('health insurance question returns healthcare docs', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.healthcare);
    expect(body.guardrail.triggered).toBe(false);
    expect(body.retrievedDocs.length).toBeGreaterThan(0);
  });

  test.describe('Guardrails — prompt injection', () => {
    for (const input of GUARDRAIL_INPUTS.promptInjection) {
      test(`blocks: "${input.substring(0, 40)}..."`, async ({ api }) => {
        const { body } = await api.sendChat(input);
        expect(body.guardrail.triggered).toBe(true);
        expect(body.guardrail.reason).toBe('prompt_injection');
      });
    }
  });

  test.describe('Guardrails — off topic', () => {
    for (const input of GUARDRAIL_INPUTS.offTopic) {
      test(`blocks: "${input}"`, async ({ api }) => {
        const { body } = await api.sendChat(input);
        expect(body.guardrail.triggered).toBe(true);
        expect(body.guardrail.reason).toBe('off_topic');
      });
    }
  });

  test.describe('Arabic language support', () => {

    test('Arabic policy question returns Arabic response', async ({ api }) => {
      const { status, body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingLicense);
      expect(status).toBe(200);
      expect(body.guardrail.triggered).toBe(false);
      expect(body.language).toBe('ar');
      expect(body.reply.length).toBeGreaterThan(0);
      // Response should contain Arabic characters
      expect(/[\u0600-\u06FF]/.test(body.reply)).toBe(true);
    });

    test('Arabic fine check returns Arabic tool response', async ({ api }) => {
      const { status, body } = await api.sendChat(CHAT_MESSAGES.arabicFineCheck);
      expect(status).toBe(200);
      expect(body.toolUsed).not.toBeNull();
      expect(body.toolUsed.name).toBe('checkFineStatus');
      expect(body.language).toBe('ar');
      // Arabic reply should contain Arabic characters
      expect(/[\u0600-\u06FF]/.test(body.reply)).toBe(true);
    });

    test('Arabic Ejari question retrieves housing docs', async ({ api }) => {
      const { status, body } = await api.sendChat(CHAT_MESSAGES.arabicEjari);
      expect(status).toBe(200);
      expect(body.language).toBe('ar');
      expect(body.retrievedDocs.length).toBeGreaterThan(0);
      // Should retrieve Ejari policy
      const ids = body.retrievedDocs.map(d => d.id);
      expect(ids).toContain('POL-018');
    });

    test('Arabic Golden Visa question returns Arabic response', async ({ api }) => {
      const { status, body } = await api.sendChat(CHAT_MESSAGES.arabicGoldenVisa);
      expect(status).toBe(200);
      expect(body.language).toBe('ar');
      expect(/[\u0600-\u06FF]/.test(body.reply)).toBe(true);
    });

    test('language field is en for English messages', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicense);
      expect(body.language).toBe('en');
    });

  });

});