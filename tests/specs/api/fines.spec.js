// ─────────────────────────────────────────────────────────────────────────────
// TC_FINE — Fines Tool API Tests
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('../../fixtures/fixtures');
const { PLATES, RESPONSE_TIMES, EN } = require('../../data/testData');
const {
  assertFineSchema,
  assertFinesResponseSchema,
  measureTime,
  assertResponseTime
} = require('../../helpers/testHelpers');

test.describe('Fines Tool API', () => {

  // ── Happy Path ──────────────────────────────────────────────────────────────
  test('[TC_FINE_001] returns 200 with unpaid fines for plate AD-1234', async ({ api }) => {
    const { status, body } = await api.getFines(PLATES.withUnpaidFines);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.fines.length).toBeGreaterThan(0);
    expect(body.unpaidTotal).toBeGreaterThan(0);
  });

  test('[TC_FINE_002] response schema is valid', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    assertFinesResponseSchema(body);
  });

  test('[TC_FINE_003] returns correct plate number in response', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    expect(body.plateNumber.toUpperCase()).toBe(PLATES.withUnpaidFines.toUpperCase());
  });

  test('[TC_FINE_004] unpaid total matches sum of unpaid fines', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    const calculated = body.fines
      .filter(f => !f.paid)
      .reduce((sum, f) => sum + f.amount, 0);
    expect(body.unpaidTotal).toBe(calculated);
  });

  test('[TC_FINE_005] every fine object has correct schema', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    for (const fine of body.fines) {
      assertFineSchema(fine);
    }
  });

  test('[TC_FINE_006] fine amounts are positive numbers', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    for (const fine of body.fines) {
      expect(fine.amount).toBeGreaterThan(0);
    }
  });

  test('[TC_FINE_007] fine dates are valid ISO date strings', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    for (const fine of body.fines) {
      expect(new Date(fine.date).toString()).not.toBe('Invalid Date');
    }
  });

  test('[TC_FINE_008] paid field is boolean on every fine', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    for (const fine of body.fines) {
      expect(typeof fine.paid).toBe('boolean');
    }
  });

  // ── No Record ───────────────────────────────────────────────────────────────
  test('[TC_FINE_009] returns empty fines array for unknown plate', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withNoRecord);
    expect(body.success).toBe(true);
    expect(body.fines).toHaveLength(0);
    expect(body.unpaidTotal).toBe(0);
  });

  test('[TC_FINE_010] message is defined for unknown plate', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withNoRecord);
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  // ── All Paid ────────────────────────────────────────────────────────────────
  test('[TC_FINE_011] unpaidTotal is 0 for plate with no records', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withNoRecord);
    expect(body.unpaidTotal).toBe(0);
  });

  // ── Edge Cases ──────────────────────────────────────────────────────────────
  test('[TC_FINE_012] handles Dubai plate format DXB-5678', async ({ api }) => {
    const { status, body } = await api.getFines(PLATES.dubaiPlate);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test('[TC_FINE_013] handles Sharjah plate format SHJ-1111', async ({ api }) => {
    const { status, body } = await api.getFines(PLATES.sharjahPlate);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test('[TC_FINE_014] plate number is case-insensitive', async ({ api }) => {
    const { body: upper } = await api.getFines('AD-1234');
    const { body: lower } = await api.getFines('ad-1234');
    expect(upper.unpaidTotal).toBe(lower.unpaidTotal);
  });

  // ── Response Time ────────────────────────────────────────────────────────────
  test('[TC_FINE_015] fine check responds within 3000ms', async ({ api }) => {
    const { durationMs } = await measureTime(() => api.getFines(PLATES.withUnpaidFines));
    assertResponseTime(durationMs, RESPONSE_TIMES.toolCall, 'Fine check');
  });

});