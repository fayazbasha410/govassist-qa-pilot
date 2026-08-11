import { describe, test, expect } from 'vitest';
import session from '../../../src/lib/session.js';
const { createSessionStore, DEFAULT_MAX_TURNS, DEFAULT_TTL_MS } = session;


describe('createSessionStore — isolation', () => {
  test('each call creates an independent store', () => {
    const storeA = createSessionStore();
    const storeB = createSessionStore();
    storeA.getSession('shared-id');
    expect(storeB.sessions.has('shared-id')).toBe(false);
  });


  test('two sessions with different IDs in the same store are independent', () => {
    const store = createSessionStore();
    const s1 = store.getSession('user-1');
    const s2 = store.getSession('user-2');
    s1.currentTopic = 'housing';
    expect(s2.currentTopic).toBeNull();
  });
});


describe('getSession', () => {
  test('creates a fresh session with expected default shape', () => {
    const store = createSessionStore();
    const session = store.getSession('new-user');
    expect(session).toMatchObject({
      history: [],
      currentTopic: null,
      currentEmirate: null,
      topicChanged: false,
      topicTurns: 0,
    });
    expect(typeof session.lastActivity).toBe('number');
  });


  test('returns the SAME session object on repeated calls with the same ID', () => {
    const store = createSessionStore();
    const first = store.getSession('user-1');
    first.currentTopic = 'business';
    const second = store.getSession('user-1');
    expect(second.currentTopic).toBe('business');
    expect(second).toBe(first);
  });


  test('updates lastActivity on every call', () => {
    const store = createSessionStore();
    const session = store.getSession('user-1');
    const firstActivity = session.lastActivity;
    // Force a later timestamp
    const later = firstActivity + 1000;
    const originalNow = Date.now;
    Date.now = () => later;
    store.getSession('user-1');
    Date.now = originalNow;
    expect(session.lastActivity).toBe(later);
  });
});


describe('addToHistory', () => {
  test('appends a message to history', () => {
    const store = createSessionStore();
    const session = store.getSession('user-1');
    store.addToHistory(session, 'user', 'Hello');
    expect(session.history).toEqual([{ role: 'user', content: 'Hello' }]);
  });


  test('trims history beyond maxTurns * 2 entries', () => {
    const store = createSessionStore({ maxTurns: 2 }); // cap = 4 entries
    const session = store.getSession('user-1');
    for (let i = 0; i < 10; i++) {
      store.addToHistory(session, i % 2 === 0 ? 'user' : 'assistant', `msg${i}`);
    }
    expect(session.history.length).toBe(4);
    // Should keep the most recent 4, not the oldest
    expect(session.history[0].content).toBe('msg6');
    expect(session.history[3].content).toBe('msg9');
  });


  test('respects a custom maxTurns option', () => {
    const store = createSessionStore({ maxTurns: 1 }); // cap = 2 entries
    const session = store.getSession('user-1');
    for (let i = 0; i < 5; i++) store.addToHistory(session, 'user', `m${i}`);
    expect(session.history.length).toBe(2);
  });
});


describe('deleteSession', () => {
  test('removes a session by ID', () => {
    const store = createSessionStore();
    store.getSession('to-delete');
    expect(store.sessions.has('to-delete')).toBe(true);
    store.deleteSession('to-delete');
    expect(store.sessions.has('to-delete')).toBe(false);
  });


  test('returns false when deleting a session that does not exist', () => {
    const store = createSessionStore();
    expect(store.deleteSession('never-existed')).toBe(false);
  });
});


describe('cleanupExpired', () => {
  test('removes sessions older than the TTL and keeps recent ones', () => {
    const store = createSessionStore({ ttlMs: 1000 }); // 1s TTL for the test
    const oldSession = store.getSession('old-user');
    const freshSession = store.getSession('fresh-user');


    // Simulate the old session being inactive for longer than the TTL
    oldSession.lastActivity = Date.now() - 5000;


    const removed = store.cleanupExpired();
    expect(removed).toBe(1);
    expect(store.sessions.has('old-user')).toBe(false);
    expect(store.sessions.has('fresh-user')).toBe(true);
  });


  test('removes nothing when all sessions are within TTL', () => {
    const store = createSessionStore({ ttlMs: DEFAULT_TTL_MS });
    store.getSession('user-1');
    store.getSession('user-2');
    expect(store.cleanupExpired()).toBe(0);
  });


  test('does not throw and returns 0 on an empty store', () => {
    const store = createSessionStore();
    expect(store.cleanupExpired()).toBe(0);
  });
});


describe('defaults', () => {
  test('uses DEFAULT_MAX_TURNS when no option is passed', () => {
    const store = createSessionStore();
    expect(store.maxTurns).toBe(DEFAULT_MAX_TURNS);
  });


  test('uses DEFAULT_TTL_MS when no option is passed', () => {
    const store = createSessionStore();
    expect(store.ttlMs).toBe(DEFAULT_TTL_MS);
  });
});