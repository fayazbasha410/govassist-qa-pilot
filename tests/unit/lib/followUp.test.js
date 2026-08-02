import { describe, test, expect } from 'vitest';
import followUp from '../../../src/lib/followUp.js';
const { isFollowUp, enrichFollowUp } = followUp;


describe('isFollowUp', () => {
  test('detects "what about X" pattern', () => {
    expect(isFollowUp('what about Sharjah?')).toBe(true);
  });


  test('detects "how about X" pattern', () => {
    expect(isFollowUp('how about Dubai?')).toBe(true);
  });


  test('detects short emirate-only message', () => {
    expect(isFollowUp('Ajman')).toBe(true);
  });


  test('detects "and X" pattern', () => {
    expect(isFollowUp('and in Fujairah?')).toBe(true);
  });


  // KNOWN ISSUE (documented, not fixed here — see chat.spec.js commit history):
  // this regex is overly broad and matches ANY "What...?" question, not just
  // genuine follow-ups. This test documents the current (buggy) behavior so
  // a future fix is a deliberate, visible change rather than a silent one.
  test('[KNOWN BUG] also matches non-follow-up "What is X" questions', () => {
    expect(isFollowUp('What is the process for VAT registration?')).toBe(true);
  });


  test('does not flag a normal "How do I" question', () => {
    expect(isFollowUp('How do I renew my Emirates ID?')).toBe(false);
  });


  test('does not flag a normal statement', () => {
    expect(isFollowUp('I need help with my visa.')).toBe(false);
  });
});


describe('enrichFollowUp', () => {
  test('builds query from session topic when message has no new topic', () => {
    const session = { currentTopic: 'housing', currentEmirate: null };
    const result = enrichFollowUp('what about Sharjah?', session);
    expect(result).toContain('sharjah');
  });


  test('includes topic keywords from session', () => {
    const session = { currentTopic: 'business', currentEmirate: null };
    const result = enrichFollowUp('what about it?', session);
    expect(result.length).toBeGreaterThan(0);
  });


  test('prefers newly detected topic over session topic', () => {
    const session = { currentTopic: 'housing', currentEmirate: null };
    const result = enrichFollowUp('what about school enrollment?', session);
    expect(result).toMatch(/school|education|enroll/);
  });


  test('returns original message when neither topic nor emirate can be determined', () => {
    const session = { currentTopic: null, currentEmirate: null };
    const message = 'xyz123 unrelated';
    expect(enrichFollowUp(message, session)).toBe(message);
  });


  test('combines topic and emirate when both are available', () => {
    const session = { currentTopic: 'housing', currentEmirate: 'dubai' };
    const result = enrichFollowUp('what about it?', session);
    expect(result).toContain('dubai');
  });
});