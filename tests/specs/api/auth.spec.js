const { test, expect } = require('../../fixtures/fixtures');
const EN = require('../../data/locale_en.json');


const VALID_PASSWORD = 'TestPass123!';


test.describe('Auth API — Register', () => {


  test.describe('Given valid registration data', () => {


    test('[AUTH-001] registers successfully and returns a token', async ({ api }) => {
      const { status, body } = await api.register({
        name: 'Ahmed Al Mansouri',
        email: api.uniqueEmail('auth001'),
        password: VALID_PASSWORD,
        emirate: 'Dubai',
      });
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.token).toBeTruthy();
      expect(body.token.length).toBeGreaterThan(20);
    });


    test('[AUTH-002] response includes expiresAt as a future ISO date', async ({ api }) => {
      const { body } = await api.register({
        name: 'Sara Al Zaabi', email: api.uniqueEmail('auth002'),
        password: VALID_PASSWORD, emirate: 'Abu Dhabi',
      });
      expect(body.expiresAt).toBeTruthy();
      expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });


    test('[AUTH-003] response includes correct user fields, no password hash', async ({ api }) => {
      const email = api.uniqueEmail('auth003');
      const { body } = await api.register({
        name: 'Fatima Al Suwaidi', email, password: VALID_PASSWORD, emirate: 'Sharjah',
      });
      expect(body.user).toMatchObject({ name: 'Fatima Al Suwaidi', email, emirate: 'Sharjah' });
      expect(body.user.password_hash).toBeUndefined();
      expect(body.user.password).toBeUndefined();
    });


    test('[AUTH-004] succeeds WITHOUT an emirate — it is optional', async ({ api }) => {
      const { status, body } = await api.register({
        name: 'Omar Khalifa', email: api.uniqueEmail('auth004'), password: VALID_PASSWORD,
      });
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.user.emirate).toBeNull();
    });


    test('[AUTH-005] accepts all 7 UAE emirates', async ({ api }) => {
      const EMIRATES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
      for (const emirate of EMIRATES) {
        const { status, body } = await api.register({
          name: `User ${emirate}`, email: api.uniqueEmail('auth005'), password: VALID_PASSWORD, emirate,
        });
        expect(status, `Register failed for emirate: ${emirate}`).toBe(200);
        expect(body.success, `Success false for emirate: ${emirate}`).toBe(true);
      }
    });


    test('[AUTH-006] trims leading/trailing whitespace from name and email', async ({ api }) => {
      const rawEmail = api.uniqueEmail('auth006');
      const { body } = await api.register({
        name: '  Khalid Al Nuaimi  ', email: `  ${rawEmail}  `, password: VALID_PASSWORD, emirate: 'Ajman',
      });
      expect(body.user.name).toBe('Khalid Al Nuaimi');
      expect(body.user.email).toBe(rawEmail.toLowerCase());
    });


    test('[AUTH-007] normalizes email to lowercase', async ({ api }) => {
      const rawEmail = api.uniqueEmail('auth007'); // already lowercase
      const { body } = await api.register({
        name: 'Mixed Case Email', email: rawEmail.toUpperCase(), password: VALID_PASSWORD, emirate: 'Dubai',
      });
      expect(body.user.email).toBe(rawEmail);
    });


  });


  test.describe('Given invalid registration data', () => {


    test('[AUTH-008] rejects missing name', async ({ api }) => {
      const { status, body } = await api.register({
        email: api.uniqueEmail('auth008'), password: VALID_PASSWORD, emirate: 'Dubai',
      });
      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });


    test('[AUTH-009] rejects missing email', async ({ api }) => {
      const { status, body } = await api.register({ name: 'Test User', password: VALID_PASSWORD, emirate: 'Dubai' });
      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });


    test('[AUTH-010] rejects missing password', async ({ api }) => {
      const { status, body } = await api.register({ name: 'Test User', email: api.uniqueEmail('auth010'), emirate: 'Dubai' });
      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });


    test('[AUTH-011] rejects malformed email — missing @', async ({ api }) => {
      const { status, body } = await api.register({
        name: 'Test User', email: 'notanemail', password: VALID_PASSWORD, emirate: 'Dubai',
      });
      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });


    test('[AUTH-012] rejects malformed email — no domain', async ({ api }) => {
      const { body } = await api.register({
        name: 'Test User', email: 'test@', password: VALID_PASSWORD, emirate: 'Dubai',
      });
      expect(body.success).toBe(false);
    });


    test('[AUTH-013] rejects password shorter than 6 characters', async ({ api }) => {
      const { status, body } = await api.register({
        name: 'Test User', email: api.uniqueEmail('auth013'), password: '123', emirate: 'Dubai',
      });
      expect(status).toBe(400);
      expect(body.error.toLowerCase()).toContain(EN.auth.password_too_short_error);
    });


    test('[AUTH-014] rejects an invalid emirate value', async ({ api }) => {
      const { status, body } = await api.register({
        name: 'Test User', email: api.uniqueEmail('auth014'), password: VALID_PASSWORD, emirate: 'Atlantis',
      });
      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });


    test('[AUTH-015] rejects duplicate email with EMAIL_EXISTS code', async ({ api }) => {
      const email = api.uniqueEmail('auth015');
      await api.register({ name: 'First User', email, password: VALID_PASSWORD, emirate: 'Dubai' });
      const { status, body } = await api.register({ name: 'Second User', email, password: VALID_PASSWORD, emirate: 'Sharjah' });
      expect(status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.code).toBe(EN.auth.error_code_email_exists);
    });


    test('[AUTH-016] duplicate check is case-insensitive on email', async ({ api }) => {
      const email = api.uniqueEmail('auth016');
      await api.register({ name: 'First User', email, password: VALID_PASSWORD, emirate: 'Dubai' });
      const { body } = await api.register({
        name: 'Second User', email: email.toUpperCase(), password: VALID_PASSWORD, emirate: 'Sharjah',
      });
      expect(body.code).toBe(EN.auth.error_code_email_exists);
    });


    test('[AUTH-017] rejects SQL-injection-shaped name', async ({ api }) => {
      const { body } = await api.register({
        name: "Robert'); DROP TABLE users; --", email: api.uniqueEmail('auth017'), password: VALID_PASSWORD, emirate: 'Dubai',
      });
      expect(body.success).toBe(false);
    });


    test('[AUTH-018] rejects XSS-shaped name', async ({ api }) => {
      const { body } = await api.register({
        name: '<script>alert("xss")</script>', email: api.uniqueEmail('auth018'), password: VALID_PASSWORD, emirate: 'Dubai',
      });
      expect(body.success).toBe(false);
    });


    test('[AUTH-019] rejects a name longer than 200 characters', async ({ api }) => {
      const { body } = await api.register({
        name: 'A'.repeat(201), email: api.uniqueEmail('auth019'), password: VALID_PASSWORD, emirate: 'Dubai',
      });
      expect(body.success).toBe(false);
    });


    test('[AUTH-020] rejects a whitespace-only name', async ({ api }) => {
      const { body } = await api.register({
        name: '     ', email: api.uniqueEmail('auth020'), password: VALID_PASSWORD, emirate: 'Dubai',
      });
      expect(body.success).toBe(false);
    });


    test('[AUTH-021] rejects a fully empty payload', async ({ api }) => {
      const { status } = await api.register({});
      expect([400, 422, 500]).toContain(status);
    });


  });
});


test.describe('Auth API — Login', () => {


  test.describe('Given valid credentials', () => {


    test('[AUTH-022] logs in successfully and returns a token', async ({ api }) => {
      const email = api.uniqueEmail('auth022');
      await api.register({ name: 'Login Test User', email, password: VALID_PASSWORD, emirate: 'Dubai' });
      const { status, body } = await api.login({ email, password: VALID_PASSWORD });
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.token).toBeTruthy();
    });


    test('[AUTH-023] login token is different from the registration token', async ({ api }) => {
      const email = api.uniqueEmail('auth023');
      const reg = await api.register({ name: 'Token Diff User', email, password: VALID_PASSWORD, emirate: 'Dubai' });
      const login = await api.login({ email, password: VALID_PASSWORD });
      expect(login.body.token).not.toBe(reg.body.token);
    });


    test('[AUTH-024] login email matching is case-insensitive', async ({ api }) => {
      const email = api.uniqueEmail('auth024');
      await api.register({ name: 'Case Test User', email, password: VALID_PASSWORD, emirate: 'Dubai' });
      const { status, body } = await api.login({ email: email.toUpperCase(), password: VALID_PASSWORD });
      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });


  });


  test.describe('Given invalid credentials', () => {


    test('[AUTH-025] rejects missing email', async ({ api }) => {
      const { status, body } = await api.login({ password: VALID_PASSWORD });
      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });


    test('[AUTH-026] rejects missing password', async ({ api }) => {
      const { status, body } = await api.login({ email: api.uniqueEmail('auth026') });
      expect(status).toBe(400);
      expect(body.success).toBe(false);
    });


    test('[AUTH-027] rejects a nonexistent email with USER_NOT_FOUND', async ({ api }) => {
      const { status, body } = await api.login({ email: api.uniqueEmail('auth027-never-registered'), password: VALID_PASSWORD });
      expect(status).toBe(404);
      expect(body.code).toBe(EN.auth.error_code_user_not_found);
    });


    test('[AUTH-028] rejects the wrong password with WRONG_PASSWORD', async ({ api }) => {
      const email = api.uniqueEmail('auth028');
      await api.register({ name: 'Wrong Pass User', email, password: VALID_PASSWORD, emirate: 'Dubai' });
      const { status, body } = await api.login({ email, password: 'DefinitelyWrong123!' });
      expect(status).toBe(401);
      expect(body.code).toBe(EN.auth.error_code_wrong_password);
    });


    test('[AUTH-029] rejects an empty payload', async ({ api }) => {
      const { status } = await api.login({});
      expect([400, 422, 500]).toContain(status);
    });


  });
});


test.describe('Auth API — Logout', () => {


  test('[AUTH-030] logout with a valid token succeeds', async ({ api }) => {
    const email = api.uniqueEmail('auth030');
    const reg = await api.register({ name: 'Logout Test User', email, password: VALID_PASSWORD, emirate: 'Dubai' });
    const { status, body } = await api.logout(reg.body.token);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });


  test('[AUTH-031] logout with no token still succeeds (never blocks a user from leaving)', async ({ api }) => {
    const { status, body } = await api.logout(null);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });


  test('[AUTH-032] logout with a garbage/invalid token still succeeds, does not crash', async ({ api }) => {
    const { status, body } = await api.logout('this-is-not-a-real-token-at-all');
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });


});


