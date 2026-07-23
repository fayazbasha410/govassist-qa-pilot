// MessageList component — encapsulates reading messages from the chat
class MessageList {
  constructor(page) {
    this.page = page;
    this.container = page.locator('#messages');
  }

  getUserMessages() {
    return this.page.locator('.message.user');
  }

  getAssistantMessages() {
    return this.page.locator('.message.assistant');
  }

  async getLastAssistantMessage(timeout = 60000) {
    // Wait for at least 2 assistant messages (welcome + reply)
    // 60s default to accommodate Groq free tier + VPN latency
    await this.page.locator('.message.assistant').nth(1)
      .waitFor({ state: 'visible', timeout });
    const all = this.getAssistantMessages();
    const count = await all.count();
    return all.nth(count - 1);
  }

  async getRagTag() {
    return this.page.locator('.tag.rag');
  }

  async getToolTag() {
    return this.page.locator('.tag.tool');
  }

  async getBlockedTag() {
    return this.page.locator('.tag.blocked');
  }

  async waitForRagTag(timeout = 60000) {
    await this.page.locator('.tag.rag').waitFor({ state: 'visible', timeout });
    return this.getRagTag();
  }

  async waitForToolTag(timeout = 60000) {
    await this.page.locator('.tag.tool').waitFor({ state: 'visible', timeout });
    return this.getToolTag();
  }

  async waitForBlockedTag(timeout = 10000) {
    await this.page.locator('.tag.blocked').waitFor({ state: 'visible', timeout });
    return this.getBlockedTag();
  }
}

module.exports = { MessageList };