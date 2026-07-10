// Header component object — encapsulates all header interactions
class Header {
    constructor(page) {
      this.page = page;
      this.root = page.locator('header');
      this.title = page.locator('header h1');
      this.subtitle = page.locator('header p');
    }
  
    async getTitle() {
      return this.title.innerText();
    }
  
    async getSubtitle() {
      return this.subtitle.innerText();
    }
  
    async isVisible() {
      return this.root.isVisible();
    }
  }
  
  module.exports = { Header };