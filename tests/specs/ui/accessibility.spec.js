/**
 * GovMurshid Accessibility Tests
 * WCAG 2.1 AA compliance using axe-core
 *
 * Proves: accessibility testing requirement from JD
 */

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
//const { injectAxe, checkA11y, getViolations } = require('@axe-core/playwright');

const BASE_URL = 'http://localhost:3000';

test.describe('GovMurshid Accessibility (WCAG 2.1 AA)', () => {

  // ── Page load accessibility ───────────────────────────
  test('home page has no critical accessibility violations', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.message.assistant');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (critical.length > 0) {
      console.log('\nCritical violations:');
      critical.forEach(v => {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        v.nodes.forEach(n => console.log(`    → ${n.target}`));
      });
    }

    expect(critical).toHaveLength(0);
  });

  test('page has a valid lang attribute', async ({ page }) => {
    await page.goto(BASE_URL);
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.message.assistant');

    const results = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.message.assistant');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    if (results.violations.length > 0) {
      console.log('\nColor contrast violations:');
      results.violations.forEach(v => {
        v.nodes.forEach(n => console.log(`  → ${n.target}: ${n.failureSummary}`));
      });
    }

    expect(results.violations).toHaveLength(0);
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.message.assistant');

    const results = await new AxeBuilder({ page })
      .withRules(['button-name', 'link-name', 'label'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('page has proper heading structure', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.message.assistant');

    const results = await new AxeBuilder({ page })
      .withRules(['heading-order', 'empty-heading'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('send button is accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.message.assistant');

    const results = await new AxeBuilder({ page })
      .include('#send-btn')
      .withRules(['button-name'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('input field is accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.message.assistant');

    const results = await new AxeBuilder({ page })
      .include('#user-input')
      .withRules(['label', 'aria-required-attr'])
      .analyze();

    expect(results.violations).toHaveLength(0);
  });

  test('page remains accessible after sending a message', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.message.assistant');

    await page.locator('#user-input').fill('How do I renew my Emirates ID?');
    await page.locator('#send-btn').click();
    await page.locator('.message.assistant').nth(1).waitFor({ timeout: 30000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toHaveLength(0);
  });

});