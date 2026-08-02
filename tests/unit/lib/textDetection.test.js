import { describe, test, expect } from 'vitest';
import textDetection from '../../../src/lib/textDetection.js';
const { TOPIC_GROUPS, EMIRATES, detectTopicGroup, detectEmirate, detectArabic } = textDetection;


describe('detectTopicGroup', () => {
  test('detects school topic from enrollment keywords', () => {
    expect(detectTopicGroup('How do I enroll my child in school?')).toBe('school');
  });


  test('detects insurance topic from health keywords', () => {
    expect(detectTopicGroup('Is health insurance mandatory?')).toBe('insurance');
  });


  test('detects visa topic from residency keywords', () => {
    expect(detectTopicGroup('How do I renew my residency visa?')).toBe('visa');
  });


  test('detects housing topic from tenancy keywords', () => {
    expect(detectTopicGroup('How do I register my tenancy contract?')).toBe('housing');
  });


  test('detects business topic from trade license keywords', () => {
    expect(detectTopicGroup('How do I renew my trade license?')).toBe('business');
  });


  test('detects social topic from gratuity keywords', () => {
    expect(detectTopicGroup('How is my end of service gratuity calculated?')).toBe('social');
  });


  test('detects utilities topic from DEWA keywords', () => {
    expect(detectTopicGroup('How do I connect DEWA electricity?')).toBe('utilities');
  });


  test('returns null when no keywords match', () => {
    expect(detectTopicGroup('What is the weather today?')).toBeNull();
  });


  test('is case-insensitive', () => {
    expect(detectTopicGroup('SCHOOL ENROLLMENT')).toBe('school');
  });


  test('does NOT detect a driving topic group (removed in v3.6.0)', () => {
    expect(TOPIC_GROUPS.driving).toBeUndefined();
  });


  test('picks the group with the highest keyword match count', () => {
    // "insurance" appears once (insurance-group word), "health" also
    // insurance-group — message should resolve to insurance, not a tie-break error
    const topic = detectTopicGroup('health insurance coverage for hospital visits');
    expect(topic).toBe('insurance');
  });
});


describe('detectEmirate', () => {
  test.each(EMIRATES)('detects "%s" when present in text', (emirate) => {
    expect(detectEmirate(`Tell me about services in ${emirate}`)).toBe(emirate);
  });


  test('returns null when no emirate is mentioned', () => {
    expect(detectEmirate('How do I renew my Emirates ID?')).toBeNull();
  });


  test('is case-insensitive', () => {
    expect(detectEmirate('Services in DUBAI')).toBe('dubai');
  });


  test('returns the first matching emirate if multiple are present', () => {
    // EMIRATES array order: abu dhabi comes before dubai
    const result = detectEmirate('Compare Abu Dhabi and Dubai services');
    expect(EMIRATES).toContain(result);
  });
});


describe('detectArabic', () => {
  test('returns true for Arabic text', () => {
    expect(detectArabic('كيف أجدد الهوية الإماراتية؟')).toBe(true);
  });


  test('returns false for English text', () => {
    expect(detectArabic('How do I renew my Emirates ID?')).toBe(false);
  });


  test('returns true for mixed Arabic/English text', () => {
    expect(detectArabic('Emirates ID رخصة')).toBe(true);
  });


  test('returns false for numbers and punctuation only', () => {
    expect(detectArabic('12345 !@#$%')).toBe(false);
  });


  test('returns false for empty string', () => {
    expect(detectArabic('')).toBe(false);
  });
});