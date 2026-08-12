const { test, expect } = require('../../fixtures/fixtures');
const { AuthPage } = require('../../pages/AuthPage');
const EN = require('../../data/locale_en.json');
const AR = require('../../data/locale_ar.json');


const VALID_PASSWORD = 'TestPass123!';


test.describe('Login page UI', () => {


  test.describe('Given valid credentials', () => {


    test('[LOGIN-UI-001] redirects to the main chat page on success', async ({ page, api }) => {
      const email = api.uniqueEmail('login-ui-001');
      await api.register({ name: 'Login UI User', email, password: VALID_PASSWORD, emirate: 'Dubai' });


      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.login({ email, password: VALID_PASSWORD });
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
    });


    test('[LOGIN-UI-002] stores the auth token and user in localStorage after login', async ({ page, api }) => {
      const email = api.uniqueEmail('login-ui-002');
      await api.register({ name: 'Storage Test User', email, password: VALID_PASSWORD, emirate: 'Dubai' });


      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.login({ email, password: VALID_PASSWORD });
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });


      const token = await auth.getLocalStorage('govmurshid_token');
      const user = await auth.getLocalStorage('govmurshid_user');
      expect(token).toBeTruthy();
      expect(JSON.parse(user).email).toBe(email);
    });


    test('[LOGIN-UI-003] login works with the email in a different case than registered', async ({ page, api }) => {
      const email = api.uniqueEmail('login-ui-003');
      await api.register({ name: 'Case Test User', email, password: VALID_PASSWORD, emirate: 'Dubai' });


      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.login({ email: email.toUpperCase(), password: VALID_PASSWORD });
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
    });


  });


  test.describe('Given invalid credentials', () => {


    test('[LOGIN-UI-004] shows an error for a nonexistent account, stays on the login page', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.login({ email: api.uniqueEmail('login-ui-004-never-registered'), password: VALID_PASSWORD });
      await expect(auth.loginError).toContainText(EN.auth.user_not_found_error, { timeout: 5000 });
      expect(page.url()).toContain('login.html');
    });


    test('[LOGIN-UI-005] shows an error for the wrong password', async ({ page, api }) => {
      const email = api.uniqueEmail('login-ui-005');
      await api.register({ name: 'Wrong Pass UI User', email, password: VALID_PASSWORD, emirate: 'Dubai' });


      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.login({ email, password: 'TotallyWrongPassword!' });
      await expect(auth.loginError).toContainText(EN.auth.wrong_password_error, { timeout: 5000 });
    });


    test('[LOGIN-UI-006] does not store any token in localStorage after a failed login', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.login({ email: api.uniqueEmail('login-ui-006-never-registered'), password: VALID_PASSWORD });
      await expect(auth.loginError).toBeVisible({ timeout: 5000 });
      const token = await auth.getLocalStorage('govmurshid_token');
      expect(token).toBeFalsy();
    });


    test('[LOGIN-UI-007] the browser\'s native required-field validation blocks an empty submit', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.submitLogin();
      // Still on the login page — native HTML5 validation, not the server,
      // should have stopped this before any request was even made.
      expect(page.url()).toContain('login.html');
    });


  });


  test.describe('Given a logged-in user visits the login page', () => {


    test('[LOGIN-UI-008] redirects away from login when a token is already present', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.setLocalStorage('govmurshid_token', 'fake-but-present-token');
      await auth.setLocalStorage('govmurshid_user', JSON.stringify({ name: 'Test', email: 'test@x.com' }));
      await auth.reload();
      await page.waitForTimeout(1000);
      expect(page.url()).not.toContain('login.html');
    });


  });


  test.describe('Given the "continue as guest" and "sign up" links', () => {


    test('[LOGIN-UI-009] "continue as guest" navigates to the main chat, no account required', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.clickContinueAsGuest();
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
    });


    test('[LOGIN-UI-010] "sign up" link navigates to the register page', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.signUpLink.click();
      await page.waitForURL(/register\.html/, { timeout: 5000 });
    });


  });


  test.describe('Given the language is toggled', () => {


    test('[LOGIN-UI-011] page heading switches to Arabic on toggle', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.toggleLanguage();
      const heading = page.locator('.auth-card h2');
      await expect(heading).toHaveText(AR.auth.welcome_back, { timeout: 3000 });
    });


    test('[LOGIN-UI-012] RTL direction is set when Arabic is toggled', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.toggleLanguage();
      expect(await auth.getPageDirection()).toBe('rtl');
    });


    test('[LOGIN-UI-013] login still works correctly with the UI in Arabic', async ({ page, api }) => {
      const email = api.uniqueEmail('login-ui-013');
      await api.register({ name: 'Arabic Login User', email, password: VALID_PASSWORD, emirate: 'Dubai' });


      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.toggleLanguage();
      await auth.login({ email, password: VALID_PASSWORD });
      await page.waitForURL(url => new URL(url).pathname === '/', { timeout: 10000 });
    });


    test('[LOGIN-UI-014] error messages remain readable (still shown) after switching to Arabic mid-flow', async ({ page, api }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.login({ email: api.uniqueEmail('login-ui-014-never-registered'), password: VALID_PASSWORD });
      await expect(auth.loginError).toBeVisible({ timeout: 5000 });
      await auth.toggleLanguage();
      // The error itself is server-returned English text and isn't
      // re-translated retroactively — this test documents that as
      // current, known behavior, not a bug: it just confirms the error
      // stays visible (doesn't vanish) across the language toggle.
      await expect(auth.loginError).toBeVisible();
    });


  });


});


