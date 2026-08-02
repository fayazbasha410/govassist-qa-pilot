// ─────────────────────────────────────────────────────────────────────────────
// TC_POL — Policy Search API Tests
// Covers all 47 policies across all 7 emirates
//
// NOTE (v3.6.0): 6 driving-license policy tests removed (transport scope
// moved to Tawfeer). Remaining tests renumbered TC_POL_001-029 to keep
// the sequence contiguous.
// ─────────────────────────────────────────────────────────────────────────────


const { test, expect } = require('../../fixtures/fixtures');
const { POLICY_QUERIES, EN } = require('../../data/testData');
const {
 assertPolicySearchSchema,
 assertPolicyInResults
} = require('../../helpers/testHelpers');


test.describe('Policy Search API', () => {


 // ── Validation ──────────────────────────────────────────────────────────────
 test('[TC_POL_001] returns 400 when query param is missing', async ({ api }) => {
   const { status, body } = await api.searchPoliciesRaw();
   expect(status).toBe(400);
   expect(body.error).toBeDefined();
 });


 test('[TC_POL_002] returns 400 for empty query string param', async ({ api }) => {
   const { status } = await api.searchPoliciesRaw('q=');
   expect(status).toBe(400);
 });


 test('[TC_POL_003] response always matches schema', async ({ api }) => {
   const { body } = await api.searchPolicies('Emirates ID');
   assertPolicySearchSchema(body);
 });


 test('[TC_POL_004] results are sorted by score descending', async ({ api }) => {
   const { body } = await api.searchPolicies('Emirates ID renewal');
   const scores = body.results.map(r => r.score);
   for (let i = 1; i < scores.length; i++) {
     expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
   }
 });


 test('[TC_POL_005] each result has id, title, content, score', async ({ api }) => {
   const { body } = await api.searchPolicies('visa');
   for (const doc of body.results) {
     expect(typeof doc.id).toBe('string');
     expect(typeof doc.title).toBe('string');
     expect(typeof doc.content).toBe('string');
     expect(typeof doc.score).toBe('number');
     expect(doc.score).toBeGreaterThan(0);
   }
 });


 // ── All UAE Policies ────────────────────────────────────────────────────────
 test('[TC_POL_006] Emirates ID query returns POL-005', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.emiratesId.query);
   assertPolicyInResults(body.results, EN.policy_ids.emirates_id);
 });


 test('[TC_POL_007] Golden Visa query returns POL-035', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.goldenVisa.query);
   assertPolicyInResults(body.results, EN.policy_ids.golden_visa);
 });


 test('[TC_POL_008] VAT registration query returns POL-023', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.vat.query);
   const ids = body.results.map(r => r.id);
   expect(ids).toContain('POL-023');
 });


 test('[TC_POL_009] gratuity query returns POL-028', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.gratuity.query);
   const ids = body.results.map(r => r.id);
   expect(ids).toContain('POL-028');
 });


 // ── Abu Dhabi Policies ──────────────────────────────────────────────────────
 test('[TC_POL_010] health card Abu Dhabi query returns POL-010', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.healthCardAD.query);
   assertPolicyInResults(body.results, EN.policy_ids.health_card_abudhabi);
 });


 test('[TC_POL_011] school enrollment Abu Dhabi query returns POL-012', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.schoolAD.query);
   assertPolicyInResults(body.results, EN.policy_ids.school_abudhabi);
 });


 test('[TC_POL_012] Tawtheeq Abu Dhabi query returns POL-019', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.ejariAD.query);
   assertPolicyInResults(body.results, EN.policy_ids.tawtheeq_abudhabi);
 });


 test('[TC_POL_013] trade license Abu Dhabi query returns POL-022', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.tradeAD.query);
   assertPolicyInResults(body.results, EN.policy_ids.trade_abudhabi);
 });


 // ── Dubai Policies ──────────────────────────────────────────────────────────
 test('[TC_POL_014] school enrollment Dubai query returns POL-011', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.schoolDubai.query);
   assertPolicyInResults(body.results, EN.policy_ids.school_dubai);
 });


 test('[TC_POL_015] DHA health insurance Dubai query returns POL-014', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.healthInsDubai.query);
   assertPolicyInResults(body.results, EN.policy_ids.health_insurance_dubai);
 });


 test('[TC_POL_016] Ejari Dubai query returns POL-018', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.ejariDubai.query);
   assertPolicyInResults(body.results, EN.policy_ids.ejari_dubai);
 });


 test('[TC_POL_017] trade license Dubai query returns POL-021', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.tradeDubai.query);
   assertPolicyInResults(body.results, EN.policy_ids.trade_dubai);
 });


 // ── Sharjah Policies ────────────────────────────────────────────────────────
 test('[TC_POL_018] health insurance Sharjah query returns POL-037', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.healthSharjah.query);
   assertPolicyInResults(body.results, EN.policy_ids.health_sharjah);
 });


 test('[TC_POL_019] school enrollment Sharjah query returns POL-038', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.schoolSharjah.query);
   assertPolicyInResults(body.results, EN.policy_ids.school_sharjah);
 });


 test('[TC_POL_020] trade license Sharjah query returns POL-040', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.tradeSharjah.query);
   assertPolicyInResults(body.results, EN.policy_ids.trade_sharjah);
 });


 // ── Ajman Policies ──────────────────────────────────────────────────────────
 test('[TC_POL_021] health insurance Ajman query returns POL-042', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.healthAjman.query);
   assertPolicyInResults(body.results, EN.policy_ids.health_ajman);
 });


 test('[TC_POL_022] school enrollment Ajman query returns POL-043', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.schoolAjman.query);
   assertPolicyInResults(body.results, EN.policy_ids.school_ajman);
 });


 // ── Umm Al Quwain Policies ──────────────────────────────────────────────────
 test('[TC_POL_023] health insurance UAQ query returns POL-046', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.healthUAQ.query);
   assertPolicyInResults(body.results, EN.policy_ids.health_uaq);
 });


 // ── Ras Al Khaimah Policies ─────────────────────────────────────────────────
 test('[TC_POL_024] health insurance RAK query returns POL-049', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.healthRAK.query);
   assertPolicyInResults(body.results, EN.policy_ids.health_rak);
 });


 test('[TC_POL_025] school enrollment RAK query returns POL-050', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.schoolRAK.query);
   assertPolicyInResults(body.results, EN.policy_ids.school_rak);
 });


 test('[TC_POL_026] trade license RAK query returns POL-051', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.tradeRAK.query);
   assertPolicyInResults(body.results, EN.policy_ids.trade_rak);
 });


 // ── Fujairah Policies ───────────────────────────────────────────────────────
 test('[TC_POL_027] health insurance Fujairah query returns POL-053', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.healthFujairah.query);
   assertPolicyInResults(body.results, EN.policy_ids.health_fujairah);
 });


 test('[TC_POL_028] school enrollment Fujairah query returns POL-054', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.schoolFujairah.query);
   assertPolicyInResults(body.results, EN.policy_ids.school_fujairah);
 });


 test('[TC_POL_029] trade license Fujairah query returns POL-055', async ({ api }) => {
   const { body } = await api.searchPolicies(POLICY_QUERIES.tradeFujairah.query);
   assertPolicyInResults(body.results, EN.policy_ids.trade_fujairah);
 });


});