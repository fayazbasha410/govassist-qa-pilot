const { test, expect } = require('../../fixtures/fixtures');
const { PLATES } = require('../../data/testData');
const { assertFineSchema } = require('../../helpers/testHelpers');

test.describe('Fines Tool API', () => {

  test('returns unpaid fines for plate AD-1234', async ({ api }) => {
    const { status, body } = await api.getFines(PLATES.withUnpaidFines);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.fines.length).toBeGreaterThan(0);
    expect(body.unpaidTotal).toBeGreaterThan(0);
  });

  test('returns correct plate number in response', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    expect(body.plateNumber.toUpperCase()).toBe(PLATES.withUnpaidFines.toUpperCase());
  });

  test('returns empty fines for plate with no record', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withNoRecord);
    expect(body.success).toBe(true);
    expect(body.fines).toHaveLength(0);
  });

  test('every fine object has correct schema', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    for (const fine of body.fines) {
      assertFineSchema(fine);
    }
  });

  test('unpaid total matches sum of unpaid fines', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    const calculatedTotal = body.fines
      .filter(f => !f.paid)
      .reduce((sum, f) => sum + f.amount, 0);
    expect(body.unpaidTotal).toBe(calculatedTotal);
  });

  test('fine amounts are positive numbers', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    for (const fine of body.fines) {
      expect(fine.amount).toBeGreaterThan(0);
    }
  });

  test('fine dates are valid date strings', async ({ api }) => {
    const { body } = await api.getFines(PLATES.withUnpaidFines);
    for (const fine of body.fines) {
      expect(new Date(fine.date).toString()).not.toBe('Invalid Date');
    }
  });

});