// ChatPage — top-level page object that composes all components
const { BasePage } = require('./BasePage');
const { Header } = require('./components/Header');
const { MessageList } = require('./components/MessageList');
const { InputBar } = require('./components/InputBar');

class ChatPage extends BasePage {
  constructor(page) {
    super(page);
    this.header = new Header(page);
    this.messages = new MessageList(page);
    this.input = new InputBar(page);
  }

  async goto() {
    await this.navigate('/');
    // Wait for welcome message to confirm page is ready
    await this.waitForSelector('.message.assistant');
  }

  async sendMessage(message) {
    await this.input.typeAndSend(message);
    return this.messages.getLastAssistantMessage();
  }

  async sendMessageWithEnter(message) {
    await this.input.sendWithEnter(message);
    return this.messages.getLastAssistantMessage();
  }

  async clickSuggestion(index = 0) {
    await this.input.clickSuggestion(index);
    return this.messages.getLastAssistantMessage();
  }
}

module.exports = { ChatPage };