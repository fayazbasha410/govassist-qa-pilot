const { defineConfig } = require('vitest/config');


module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.js'],
    // Unit tests must never touch the network — if a test tries to call
    // Groq or any external API, that's a sign it belongs in the Playwright
    // E2E suite instead, not here.
    testTimeout: 5000,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/unit',
      include: ['src/lib/**/*.js'],
    },
  },
});