// InputBar component — encapsulates the chat input area
class InputBar {
    constructor(page) {
      this.page = page;
      this.input = page.locator('#user-input');
      this.sendButton = page.locator('#send-btn');
      this.suggestionButtons = page.locator('.suggestion-btn');
    }
  
    async type(message) {
      await this.input.fill(message);
    }
  
    async send() {
      await this.sendButton.click();
    }
  
    async typeAndSend(message) {
      await this.type(message);
      await this.send();
    }
  
    async sendWithEnter(message) {
      await this.type(message);
      await this.input.press('Enter');
    }
  
    async clickSuggestion(index = 0) {
      await this.suggestionButtons.nth(index).click();
    }
  
    async getSuggestionCount() {
      return this.suggestionButtons.count();
    }
  
    async isSendButtonDisabled() {
      return this.sendButton.isDisabled();
    }
  
    async isInputVisible() {
      return this.input.isVisible();
    }
  }
  
  module.exports = { InputBar };  