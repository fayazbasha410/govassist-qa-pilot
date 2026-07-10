const { test, expect } = require('../../fixtures/fixtures');
const { POLICY_QUERIES } = require('../../data/testData');

test.describe('Policy Search API', () => {

  test('returns 400 when query param is missing', async ({ api }) => {
    const { status, body } = await api.searchPoliciesRaw();
    expect(status).toBe(400);
    expect(body.error).toBeDefined();
  });

  test('driving license query returns POL-001 as top result', async ({ api }) => {
    const { status, body } = await api.searchPolicies(POLICY_QUERIES.drivingLicense.query);
    expect(status).toBe(200);
    expect(body.results[0].id).toBe('POL-001');
    expect(body.results[0].title).toContain('Driving');
  });

  test('Emirates ID query returns POL-005', async ({ api }) => {
    const { body } = await api.searchPolicies(POLICY_QUERIES.emiratesId.query);
    const ids = body.results.map(r => r.id);
    expect(ids).toContain('POL-005');
  });

  test('Dubai health insurance query returns DHA policy', async ({ api }) => {
    const { body } = await api.searchPolicies('DHA health insurance Dubai');
    const ids = body.results.map(r => r.id);
    expect(ids).toContain('POL-014');
  });

  test('Ejari tenancy query returns Dubai housing policy', async ({ api }) => {
    const { body } = await api.searchPolicies('Ejari tenancy registration Dubai');
    const ids = body.results.map(r => r.id);
    expect(ids).toContain('POL-018');
  });

  test('trade license Dubai query returns DET policy', async ({ api }) => {
    const { body } = await api.searchPolicies('trade license renewal Dubai');
    const ids = body.results.map(r => r.id);
    expect(ids).toContain('POL-021');
  });

  test('Golden Visa query returns correct policy', async ({ api }) => {
    const { body } = await api.searchPolicies('Golden Visa application UAE');
    const ids = body.results.map(r => r.id);
    expect(ids).toContain('POL-035');
  });

  test('results array is never empty for valid queries', async ({ api }) => {
    const { body } = await api.searchPolicies('license');
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
  });

  test('each result has required fields', async ({ api }) => {
    const { body } = await api.searchPolicies('visa');
    for (const doc of body.results) {
      expect(typeof doc.id).toBe('string');
      expect(typeof doc.title).toBe('string');
      expect(typeof doc.content).toBe('string');
      expect(typeof doc.score).toBe('number');
    }
  });

});