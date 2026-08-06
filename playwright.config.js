import { defineConfig, devices } from '@playwright/test';








export default defineConfig({
  testDir: './tests/specs',
  timeout: 120000,
  retries: 2,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // AUDIT NOTE (this round): reverting the CI-only bump to 3 workers from
  // earlier this session. New evidence overrides that earlier change — a
  // real qa-checks.yml CI run showed exactly the TPM collision pattern
  // already proven against promptfoo's --max-concurrency (Groq TPM ceiling
  // is 6000/min, single full-RAG requests already need 4000-5200 tokens).
  // 3 concurrent Playwright workers means 3 concurrent real /api/chat
  // calls against the same GROQ_API_KEY — the same root cause, different
  // test runner. Uniform workers: 1 until there's a real reason (e.g. a
  // separate Groq key per CI job) to safely reintroduce concurrency.
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});