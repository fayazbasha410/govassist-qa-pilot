// Shared utility functions used across all spec files

/**
 * Wait for the nth assistant message to appear
 * (nth=1 means the first reply after the welcome message)
 */
async function waitForAssistantReply(page, nth = 1, timeout = 30000) {
    const reply = page.locator('.message.assistant').nth(nth);
    await reply.waitFor({ state: 'visible', timeout });
    return reply;
  }
  
  /**
   * Send a chat message via the UI and wait for the reply
   */
  async function sendMessageAndWait(page, message, timeout = 30000) {
    await page.locator('#user-input').fill(message);
    await page.locator('#send-btn').click();
    return waitForAssistantReply(page, 1, timeout);
  }
  
  /**
   * Assert that a response contains a specific tag type
   * tagType: 'rag' | 'tool' | 'blocked'
   */
  async function expectTag(page, tagType, timeout = 30000) {
    const tag = page.locator(`.tag.${tagType}`);
    await tag.waitFor({ state: 'visible', timeout });
    return tag;
  }
  
  /**
   * Validate the shape of a chat API response body
   * Throws if any required field is missing or wrong type
   */
  function assertChatResponseSchema(body) {
    if (typeof body.reply !== 'string' || body.reply.length === 0) {
      throw new Error('reply must be a non-empty string');
    }
    if (typeof body.guardrail !== 'object') {
      throw new Error('guardrail must be an object');
    }
    if (typeof body.guardrail.triggered !== 'boolean') {
      throw new Error('guardrail.triggered must be a boolean');
    }
    if (!Array.isArray(body.retrievedDocs)) {
      throw new Error('retrievedDocs must be an array');
    }
  }
  
  /**
   * Validate the shape of a fine record
   */
  function assertFineSchema(fine) {
    if (typeof fine.id !== 'string') throw new Error('fine.id must be string');
    if (typeof fine.amount !== 'number') throw new Error('fine.amount must be number');
    if (typeof fine.reason !== 'string') throw new Error('fine.reason must be string');
    if (typeof fine.date !== 'string') throw new Error('fine.date must be string');
    if (typeof fine.paid !== 'boolean') throw new Error('fine.paid must be boolean');
  }
  
  /**
   * Validate the shape of an appointment response
   */
  function assertAppointmentSchema(body) {
    if (typeof body.success !== 'boolean') throw new Error('success must be boolean');
    if (body.success) {
      if (!body.confirmationNumber.startsWith('TAMM-')) {
        throw new Error('confirmationNumber must start with TAMM-');
      }
      if (typeof body.service !== 'string') throw new Error('service must be string');
      if (typeof body.date !== 'string') throw new Error('date must be string');
      if (typeof body.location !== 'string') throw new Error('location must be string');
    }
  }
  
  module.exports = {
    waitForAssistantReply,
    sendMessageAndWait,
    expectTag,
    assertChatResponseSchema,
    assertFineSchema,
    assertAppointmentSchema
  };  