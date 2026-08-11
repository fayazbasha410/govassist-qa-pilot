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


  async getLastAssistantMessage(timeout = 90000) {
    // Wait for at least 2 assistant messages (welcome + reply)
    // AUDIT NOTE (this round): raised from 60000 to 90000. A real CI run
    // showed TC_UI_018 timing out here 3/3 attempts at exactly ~1.0m —
    // this default was set before the retry-after fix existed, which can
    // now legitimately add up to 30s on top of normal generation time on
    // a single request. 90s gives real headroom for that worst case.
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


  async waitForRagTag(timeout = 90000) {
    await this.page.locator('.tag.rag').waitFor({ state: 'visible', timeout });
    return this.getRagTag();
  }


  async waitForToolTag(timeout = 90000) {
    await this.page.locator('.tag.tool').waitFor({ state: 'visible', timeout });
    return this.getToolTag();
  }


  async waitForBlockedTag(timeout = 10000) {
    await this.page.locator('.tag.blocked').waitFor({ state: 'visible', timeout });
    return this.getBlockedTag();
  }
}


module.exports = { MessageList };


