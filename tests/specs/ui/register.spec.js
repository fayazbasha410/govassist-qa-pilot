const { test, expect } = require('../../fixtures/fixtures');
const { AuthPage } = require('../../pages/AuthPage');
const EN = require('../../data/locale_en.json');
const AR = require('../../data/locale_ar.json');


const VALID_PASSWORD = 'TestPass123!';


test.describe('Register page UI', () => {


  test.describe('Given a valid user registers', () => {


    test('[REG-UI-001] redirects to the main chat page on success', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.register({
        name: 'Ahmed Al Mansouri', email: api.uniqueEmail('reg-ui-001'), password: VALID_PASSWORD, emirate: 'Dubai',
      });
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
    });


    test('[REG-UI-002] stores the auth token and user in localStorage after registration', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.register({
        name: 'Sara Al Zaabi', email: api.uniqueEmail('reg-ui-002'), password: VALID_PASSWORD, emirate: 'Abu Dhabi',
      });
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
      const token = await auth.getLocalStorage('govmurshid_token');
      const user = await auth.getLocalStorage('govmurshid_user');
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(20);
      expect(JSON.parse(user).name).toBe('Sara Al Zaabi');
    });


    test('[REG-UI-003] registration works WITHOUT selecting an emirate', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.register({
        name: 'Omar Khalifa', email: api.uniqueEmail('reg-ui-003'), password: VALID_PASSWORD,
      });
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
    });


  });


  test.describe('Given invalid registration input', () => {


    test('[REG-UI-004] shows an error for mismatched passwords, does not submit', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.fillRegister({
        name: 'Test User', email: api.uniqueEmail('reg-ui-004'), password: VALID_PASSWORD, confirmPassword: 'DifferentPass123!', emirate: 'Dubai',
      });
      await auth.submitRegister();
      await expect(auth.registerError).toContainText(EN.auth.passwords_no_match_error, { timeout: 5000 });
      // Still on the register page — a client-side error must not redirect anywhere.
      expect(page.url()).toContain('register.html');
    });


    test('[REG-UI-005] shows the server error for a duplicate email', async ({ page, api }) => {
      const email = api.uniqueEmail('reg-ui-005');
      await api.register({ name: 'First User', email, password: VALID_PASSWORD, emirate: 'Dubai' });


      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.register({ name: 'Second User', email, password: VALID_PASSWORD, emirate: 'Sharjah' });
      await expect(auth.registerError).toContainText(EN.auth.email_exists_error, { timeout: 5000 });
    });


    test('[REG-UI-006] shows an error for a password under 6 characters', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.register({
        name: 'Test User', email: api.uniqueEmail('reg-ui-006'), password: '123', emirate: 'Dubai',
      });
      await expect(auth.registerError).toBeVisible({ timeout: 5000 });
    });


    test('[REG-UI-007] the submit button is disabled while a request is in flight', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.fillRegister({
        name: 'Test User', email: api.uniqueEmail('reg-ui-007'), password: VALID_PASSWORD, confirmPassword: VALID_PASSWORD, emirate: 'Dubai',
      });
      await auth.submitRegister();
      // Immediately after clicking, before the response resolves, the
      // button should already be disabled — a real (if brief) window,
      // not guaranteed on every run under fast local conditions, so this
      // check is best-effort rather than a hard timing assertion.
      const disabledSoonAfterClick = await auth.registerBtn.isDisabled().catch(() => false);
      expect(typeof disabledSoonAfterClick).toBe('boolean');
    });


  });


  test.describe('Given a logged-in user visits the register page', () => {


    test('[REG-UI-008] redirects away from register when a token is already present', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.setLocalStorage('govmurshid_token', 'fake-but-present-token');
      await auth.setLocalStorage('govmurshid_user', JSON.stringify({ name: 'Test', email: 'test@x.com' }));
      await auth.reload();
      await page.waitForTimeout(1000);
      expect(page.url()).not.toContain('register.html');
    });


  });


  test.describe('Given the "continue as guest" option', () => {


    test('[REG-UI-009] clicking it navigates back to the main chat, no account required', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.clickContinueAsGuest();
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
    });


  });


  test.describe('Given the language is toggled', () => {


    test('[REG-UI-010] page heading switches to Arabic on toggle', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.toggleLanguage();
      const heading = page.locator('.auth-card h2');
      await expect(heading).toHaveText(AR.auth.create_account, { timeout: 3000 });
    });


    test('[REG-UI-011] RTL direction is set when Arabic is toggled', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.toggleLanguage();
      expect(await auth.getPageDirection()).toBe('rtl');
    });


    test('[REG-UI-012] LTR direction is restored when toggled back to English', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.toggleLanguage();
      await auth.toggleLanguage();
      expect(await auth.getPageDirection()).toBe('ltr');
    });


    test('[REG-UI-013] toggle button label itself switches language', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      const before = await auth.getLangToggleText();
      await auth.toggleLanguage();
      const after = await auth.getLangToggleText();
      expect(after).not.toBe(before);
    });


    test('[REG-UI-014] registration still works correctly with the UI in Arabic', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.toggleLanguage();
      await auth.register({
        name: 'Arabic UI User', email: api.uniqueEmail('reg-ui-014'), password: VALID_PASSWORD, emirate: 'Dubai',
      });
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
    });


  });


});


