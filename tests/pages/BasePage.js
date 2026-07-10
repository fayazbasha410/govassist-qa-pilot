// All page classes extend this — common actions live here once
class BasePage {
    constructor(page) {
      this.page = page;
      this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    }
  
    async navigate(path = '') {
      await this.page.goto(`${this.baseUrl}${path}`);
    }
  
    async getTitle() {
      return this.page.title();
    }
  
    async waitForSelector(selector, timeout = 10000) {
      await this.page.waitForSelector(selector, { timeout });
    }
  
    async isVisible(selector) {
      return this.page.locator(selector).isVisible();
    }
  }
  
  module.exports = { BasePage };  