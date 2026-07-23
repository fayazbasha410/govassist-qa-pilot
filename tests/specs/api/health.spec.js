// ─────────────────────────────────────────────────────────────────────────────
// TC_HEALTH — Health Check API Tests
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('../../fixtures/fixtures');
const { measureTime, assertResponseTime } = require('../../helpers/testHelpers');
const { EN, RESPONSE_TIMES } = require('../../data/testData');

test.describe('Health Check API', () => {

  test('[TC_H_001] returns 200 with status ok', async ({ api }) => {
    const { status, body } = await api.getHealth();
    expect(status).toBe(200);
    expect(body.status).toBe('ok');
  });

  test('[TC_H_002] returns name as GovMurshid', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.name).toBe(EN.app_name);
  });

  test('[TC_H_003] returns version as string', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(typeof body.version).toBe('string');
    expect(body.version.length).toBeGreaterThan(0);
  });

  test('[TC_H_004] returns model field referencing Groq', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(typeof body.model).toBe('string');
    expect(body.model).toContain('groq');
  });

  test('[TC_H_005] returns toolCalling field as native', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.toolCalling).toBe('native');
  });

  test('[TC_H_006] returns memory field as multi-turn', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.memory).toBe('multi-turn');
  });

  test('[TC_H_007] returns policies count as 55', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.policies).toBe(55);
  });

  test('[TC_H_008] health check responds within 500ms', async ({ api }) => {
    const { durationMs } = await measureTime(() => api.getHealth());
    assertResponseTime(durationMs, RESPONSE_TIMES.healthCheck, 'Health check');
  });

  test('[TC_H_009] repeated health checks all return 200', async ({ api }) => {
    for (let i = 0; i < 3; i++) {
      const { status } = await api.getHealth();
      expect(status).toBe(200);
    }
  });

});