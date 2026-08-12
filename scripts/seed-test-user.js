#!/usr/bin/env node
/**
 * GovMurshid — Seed a test user
 *
 * Creates one real, working account for manual testing / future
 * Playwright auth specs, using the ACTUAL register code path (not a raw
 * DB insert) — so this also doubles as a quick real-world check that
 * registration itself works end to end.
 *
 * Reads credentials from .env — never hardcode a real password in a
 * script. Idempotent: if the user already exists, logs in instead of
 * failing, matching Tawfeer's real duplicate-email handling philosophy.
 *
 * Usage: node scripts/seed-test-user.js
 * Requires: the server running locally (npm start), TEST_USER_* in .env
 */


require('dotenv').config();


const BASE_URL = process.env.EVAL_SERVER_URL || 'http://localhost:3000';


const TEST_USER_NAME = process.env.TEST_USER_NAME;
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
const TEST_USER_EMIRATE = process.env.TEST_USER_EMIRATE || '';


async function main() {
  if (!TEST_USER_NAME || !TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
    console.error('❌ Missing TEST_USER_NAME / TEST_USER_EMAIL / TEST_USER_PASSWORD in .env');
    console.error('   Add these three lines to .env, then re-run this script:');
    console.error('   TEST_USER_NAME=Test User');
    console.error('   TEST_USER_EMAIL=test@govmurshid.ae');
    console.error('   TEST_USER_PASSWORD=TestPass123!');
    process.exit(1);
  }


  console.log('🇦🇪 GovMurshid — Seeding test user\n');


  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: TEST_USER_NAME,
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      emirate: TEST_USER_EMIRATE,
    }),
  });
  const registerBody = await registerRes.json();


  if (registerBody.success) {
    console.log('✅ Test user created:');
    console.log(`   Email: ${TEST_USER_EMAIL}`);
    console.log(`   Name:  ${registerBody.user.name}`);
    console.log(`   Token: ${registerBody.token.slice(0, 16)}... (expires ${registerBody.expiresAt})`);
    return;
  }


  if (registerBody.code === 'EMAIL_EXISTS') {
    console.log('ℹ️  Test user already exists — verifying login works instead...\n');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }),
    });
    const loginBody = await loginRes.json();


    if (loginBody.success) {
      console.log('✅ Confirmed: test user exists and the password in .env is correct.');
      console.log(`   Email: ${TEST_USER_EMAIL}`);
    } else {
      console.error('❌ Test user exists, but login failed with the current TEST_USER_PASSWORD.');
      console.error(`   Server said: ${loginBody.error}`);
      console.error('   Either the password in .env was changed after the account was created,');
      console.error('   or the account was created with a different password originally.');
      process.exit(1);
    }
    return;
  }


  console.error('❌ Failed to seed test user:', registerBody.error);
  process.exit(1);
}


main().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  console.error('   Is the server running? (npm start)');
  process.exit(2);
});


