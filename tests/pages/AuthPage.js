const { BasePage } = require('./BasePage');


// AUDIT NOTE: adapted from Tawfeer's real, proven AuthPage.js (sister
// project) — same data-test-id convention, same method shapes. Real
// differences from Tawfeer, deliberate, not oversights: GovMurshid
// redirects to '/' on success (not a separate chat.html — GovMurshid's
// chat IS the index page), emirate is OPTIONAL here (Tawfeer requires
// it), and there's a "continue as guest" link GovMurshid has that
// Tawfeer doesn't (GovMurshid supports full anonymous use).
class AuthPage extends BasePage {
  constructor(page) {
    super(page);


    // Register page
    this.nameInput            = page.locator('[data-test-id="register-name"]');
    this.registerEmailInput   = page.locator('[data-test-id="register-email"]');
    this.registerPasswordInput = page.locator('[data-test-id="register-password"]');
    this.confirmPasswordInput = page.locator('[data-test-id="register-confirm-password"]');
    this.emirateSelect        = page.locator('[data-test-id="register-emirate"]');
    this.registerBtn          = page.locator('[data-test-id="register-btn"]');
    this.registerError        = page.locator('[data-test-id="register-error"]');


    // Login page
    this.loginEmailInput    = page.locator('[data-test-id="login-email"]');
    this.loginPasswordInput = page.locator('[data-test-id="login-password"]');
    this.loginBtn           = page.locator('[data-test-id="login-btn"]');
    this.loginError         = page.locator('[data-test-id="login-error"]');


    // Shared across both pages
    this.langToggle = page.locator('[data-test-id="lang-toggle-btn"]');
    this.guestLink   = page.locator('.guest-link a');
    this.signUpLink  = page.locator('.auth-links a[href*="register"]');
    this.signInLink  = page.locator('.auth-links a[href*="login"]');
  }


  async goToRegister() {
    await this.navigate('/pages/register.html');
    await this.waitForSelector('[data-test-id="register-btn"]');
  }


  async goToLogin() {
    await this.navigate('/pages/login.html');
    await this.waitForSelector('[data-test-id="login-btn"]');
  }


  async fillRegister({ name, email, password, confirmPassword, emirate }) {
    if (name !== undefined) await this.nameInput.fill(name);
    if (email !== undefined) await this.registerEmailInput.fill(email);
    if (password !== undefined) await this.registerPasswordInput.fill(password);
    if (confirmPassword !== undefined) await this.confirmPasswordInput.fill(confirmPassword);
    if (emirate !== undefined && emirate !== '') await this.emirateSelect.selectOption(emirate);
  }


  async submitRegister() {
    await this.registerBtn.click();
  }


  async register(user) {
    // Defaults confirmPassword to match password unless a mismatch is
    // specifically what's being tested — keeps most call sites terse.
    const payload = { confirmPassword: user.password, ...user };
    await this.fillRegister(payload);
    await this.submitRegister();
  }


  async fillLogin({ email, password }) {
    if (email !== undefined) await this.loginEmailInput.fill(email);
    if (password !== undefined) await this.loginPasswordInput.fill(password);
  }


  async submitLogin() {
    await this.loginBtn.click();
  }


  async login(credentials) {
    await this.fillLogin(credentials);
    await this.submitLogin();
  }


  async getRegisterErrorText() {
    return this.registerError.innerText();
  }


  async getLoginErrorText() {
    return this.loginError.innerText();
  }


  async toggleLanguage() {
    await this.langToggle.click();
  }


  async getLangToggleText() {
    return this.langToggle.innerText();
  }


  async clickContinueAsGuest() {
    await this.guestLink.click();
  }


  async registerAndRedirectHome(user) {
    await this.goToRegister();
    await this.register(user);
    await this.page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
  }


  async loginAndRedirectHome(credentials) {
    await this.goToLogin();
    await this.login(credentials);
    await this.page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
  }
}


module.exports = { AuthPage };
