import { describe, test, expect } from 'vitest';
import sanitizer from '../../../src/lib/sanitizer.js';
const { sanitiseOutput } = sanitizer;


describe('sanitiseOutput — English mode', () => {
  test('passes through clean English text unchanged', () => {
    expect(sanitiseOutput('Hello World', false)).toBe('Hello World');
  });


  test('strips stray CJK characters (hallucination bug regression test)', () => {
    // This is the exact bug class the sanitiser was built to catch —
    // see server.js Fix 1 comment history
    expect(sanitiseOutput('Hello 世 World', false)).toBe('Hello  World');
  });


  test('preserves policy IDs like POL-001', () => {
    expect(sanitiseOutput('See policy POL-001 for details.', false)).toBe('See policy POL-001 for details.');
  });


  test('preserves standard punctuation', () => {
    expect(sanitiseOutput('Fee: AED 100–370 (approx.), valid 3-5 days!', false))
      .toBe('Fee: AED 100370 (approx.), valid 3-5 days!');
  });


  test('collapses 3+ consecutive whitespace into a paragraph break', () => {
    expect(sanitiseOutput('Line one.   Line two.', false)).toBe('Line one.\n\nLine two.');
  });


  test('trims leading/trailing whitespace', () => {
    expect(sanitiseOutput('  Hello World  ', false)).toBe('Hello World');
  });


  test('returns falsy input unchanged (null/empty passthrough)', () => {
    expect(sanitiseOutput('', false)).toBe('');
    expect(sanitiseOutput(null, false)).toBe(null);
  });
});


describe('sanitiseOutput — Arabic mode', () => {
  test('passes through clean Arabic text unchanged (aside from whitespace collapse)', () => {
    expect(sanitiseOutput('مرحبا بالعالم', true)).toBe('مرحبا بالعالم');
  });


  test('preserves Latin policy IDs within Arabic text', () => {
    expect(sanitiseOutput('راجع السياسة POL-005 للتفاصيل', true)).toBe('راجع السياسة POL-005 للتفاصيل');
  });


  test('preserves Arabic-Indic digits and punctuation', () => {
    expect(sanitiseOutput('الرسوم ١٢٣ درهم؟', true)).toBe('الرسوم ١٢٣ درهم؟');
  });


  test('strips stray CJK characters from Arabic responses too', () => {
    const result = sanitiseOutput('مرحبا 世 بالعالم', true);
    expect(result).not.toContain('世');
  });
});