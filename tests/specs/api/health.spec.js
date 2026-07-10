const { test, expect } = require('../../fixtures/fixtures');

test.describe('Health Check API', () => {

  test('returns 200 with status ok', async ({ api }) => {
    const { status, body } = await api.getHealth();
    expect(status).toBe(200);
    expect(body.status).toBe('ok');
  });

  test('returns version field', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.version).toBeDefined();
    expect(typeof body.version).toBe('string');
  });

  test('returns model field', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.model).toBeDefined();
    expect(typeof body.model).toBe('string');
  });

});