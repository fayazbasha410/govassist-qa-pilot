import { describe, test, expect } from 'vitest';
import ragEngine from '../../../src/lib/ragEngine.js';
const { retrieveRelevantDocs, computeConfidence } = ragEngine;


// Small fixture dataset — deliberately not the real 58-policy set, so
// these tests verify the SCORING ALGORITHM itself, independent of
// whatever real policy content exists at any point in time.
const fixturePolicies = [
  { id: 'FIX-001', emirate: 'All UAE', category: 'identity', title: 'Emirates ID Renewal', content: 'Renew your Emirates ID before expiry via ICP Smart Services.' },
  { id: 'FIX-002', emirate: 'Dubai', category: 'housing', title: 'Ejari Tenancy Registration', content: 'Register your tenancy contract with Ejari in Dubai.' },
  { id: 'FIX-003', emirate: 'Abu Dhabi', category: 'housing', title: 'Tawtheeq Tenancy Registration', content: 'Register your tenancy contract with Tawtheeq in Abu Dhabi.' },
  { id: 'FIX-004', emirate: 'All UAE', category: 'business', title: 'VAT Registration', content: 'Register for VAT if taxable supplies exceed AED 375,000.' },
  { id: 'FIX-005', emirate: 'Sharjah', category: 'healthcare', title: 'Health Insurance Sharjah', content: 'Health insurance is mandatory for private sector employees in Sharjah.' },
];


describe('retrieveRelevantDocs', () => {
  test('returns the best keyword match at rank 0', () => {
    const results = retrieveRelevantDocs('Emirates ID renewal', fixturePolicies, 5);
    expect(results[0].id).toBe('FIX-001');
  });


  test('title matches score higher than body-only matches', () => {
    const results = retrieveRelevantDocs('VAT registration', fixturePolicies, 5);
    expect(results[0].id).toBe('FIX-004');
  });


  test('applies +5 emirate boost for exact emirate match', () => {
    const results = retrieveRelevantDocs('tenancy contract registration Dubai', fixturePolicies, 5);
    expect(results[0].id).toBe('FIX-002');
    // Abu Dhabi's Tawtheeq policy should rank below Dubai's despite similar content
    const dubaiScore = results.find(r => r.id === 'FIX-002').score;
    const adScore = results.find(r => r.id === 'FIX-003')?.score ?? -Infinity;
    expect(dubaiScore).toBeGreaterThan(adScore);
  });


  test('applies -2 penalty for wrong-emirate policies when an emirate is specified', () => {
    const results = retrieveRelevantDocs('tenancy contract registration Dubai', fixturePolicies, 5);
    const adResult = results.find(r => r.id === 'FIX-003');
    // FIX-003 (Abu Dhabi) should score lower than it would with no emirate specified,
    // due to the -2 wrong-emirate penalty
    const noEmirateResults = retrieveRelevantDocs('tenancy contract registration', fixturePolicies, 5);
    const adNoEmirateScore = noEmirateResults.find(r => r.id === 'FIX-003').score;
    expect(adResult ? adResult.score : -Infinity).toBeLessThan(adNoEmirateScore);
  });


  test('applies +1 boost for "All UAE" policies regardless of specified emirate', () => {
    const results = retrieveRelevantDocs('Emirates ID Dubai', fixturePolicies, 5);
    const fix001 = results.find(r => r.id === 'FIX-001');
    expect(fix001).toBeDefined();
  });


  test('expands synonyms — "renew" query matches "renewal" content', () => {
    const results = retrieveRelevantDocs('renew Emirates ID', fixturePolicies, 5);
    expect(results.some(r => r.id === 'FIX-001')).toBe(true);
  });


  test('filters out zero-score documents entirely', () => {
    const results = retrieveRelevantDocs('completely unrelated nonsense xyz123', fixturePolicies, 5);
    expect(results).toHaveLength(0);
  });


  test('respects topK limit', () => {
    const results = retrieveRelevantDocs('registration', fixturePolicies, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });


  test('results are sorted by score descending', () => {
    const results = retrieveRelevantDocs('registration tenancy contract', fixturePolicies, 5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });


  test('is case-insensitive', () => {
    const lower = retrieveRelevantDocs('emirates id renewal', fixturePolicies, 5);
    const upper = retrieveRelevantDocs('EMIRATES ID RENEWAL', fixturePolicies, 5);
    expect(lower[0]?.id).toBe(upper[0]?.id);
  });


  test('returns empty array for empty policy list', () => {
    expect(retrieveRelevantDocs('anything', [], 5)).toEqual([]);
  });
});


describe('computeConfidence', () => {
  test('returns low confidence with no policyId for empty docs', () => {
    const result = computeConfidence([], 'some query');
    expect(result.level).toBe('low');
    expect(result.policyId).toBeNull();
  });


  test('returns high confidence for strong, well-separated top score', () => {
    const docs = [
      { id: 'FIX-001', score: 10, emirate: 'All UAE' },
      { id: 'FIX-002', score: 2, emirate: 'Dubai' },
    ];
    const result = computeConfidence(docs, 'test query');
    expect(result.level).toBe('high');
    expect(result.policyId).toBe('FIX-001');
  });


  test('returns medium confidence for moderate score', () => {
    const docs = [
      { id: 'FIX-001', score: 6, emirate: 'All UAE' },
      { id: 'FIX-002', score: 5, emirate: 'Dubai' },
    ];
    const result = computeConfidence(docs, 'test query');
    expect(result.level).toBe('medium');
  });


  test('returns low confidence for weak, ambiguous score', () => {
    const docs = [
      { id: 'FIX-001', score: 1, emirate: 'All UAE' },
    ];
    const result = computeConfidence(docs, 'test query');
    expect(result.level).toBe('low');
  });


  test('handles a single result (no second-place comparison) without throwing', () => {
    const docs = [{ id: 'FIX-001', score: 10, emirate: 'All UAE' }];
    expect(() => computeConfidence(docs, 'test')).not.toThrow();
  });


  test('reason mentions emirate match when query emirate equals top result emirate', () => {
    const docs = [
      { id: 'FIX-002', score: 10, emirate: 'Dubai' },
      { id: 'FIX-003', score: 2, emirate: 'Abu Dhabi' },
    ];
    const result = computeConfidence(docs, 'tenancy Dubai');
    expect(result.reason).toContain('emirate-specific');
  });
});