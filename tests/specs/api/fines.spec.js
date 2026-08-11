// ─────────────────────────────────────────────────────────────────────────────
// TC_FINE — Fines Tool API Tests
//
// NOTE (v3.6.0): Traffic fine checking is transport-scoped and now belongs
// to the sister project, Tawfeer (tawfeer-ai.onrender.com). checkFineStatus
// in agentTools.js is now a stub that always returns a redirect — these
// tests were rewritten to verify that redirect behavior instead of real
// fine data (the original 15 assertions no longer apply).
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('../../fixtures/fixtures');

test.describe('Fines Tool API (stub / redirect)', () => {

  test('[TC_FINE_001] returns success: false for any plate', async ({ api }) => {
    const { status, body } = await api.getFines('AD-1234');
    expect(status).toBe(200);
    expect(body.success).toBe(false);
  });

  test('[TC_FINE_002] response includes a redirect URL to Tawfeer', async ({ api }) => {
    const { body } = await api.getFines('AD-1234');
    expect(body.redirect).toBe('https://tawfeer-ai.onrender.com');
  });

  test('[TC_FINE_003] message mentions Tawfeer and includes the plate number', async ({ api }) => {
    const { body } = await api.getFines('DXB-5678');
    expect(body.message).toContain('Tawfeer');
    expect(body.message).toContain('DXB-5678');
  });

});