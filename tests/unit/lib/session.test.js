import { describe, test, expect } from 'vitest';
import session from '../../../src/lib/session.js';
const { createSessionStore, DEFAULT_MAX_TURNS, DEFAULT_TTL_MS } = session;


// ─────────────────────────────────────────
// Mock Supabase client
//
// session.js now calls a real Supabase client, not an in-memory Map — so
// these tests mock the query-builder chain rather than reaching into a
// store's internals. Each mock instance has its own isolated in-memory
// Map, matching the original test file's per-test isolation intent, just
// implemented via mock injection (createSessionStore's supabaseClient
// option) instead of separate real Map instances.
//
// Only implements the exact chain shapes session.js actually calls:
//   .from(t).select('*').eq('id', x).maybeSingle()
//   .from(t).upsert({...})
//   .from(t).delete().eq('id', x).select('id')
//   .from(t).delete().lt('last_activity', x).select('id')
// ─────────────────────────────────────────
function createMockSupabase() {
  const rows = new Map(); // id -> row


  function builder(mode) {
    const state = { mode, eqId: null, ltField: null, ltValue: null };


    const chain = {
      eq(col, val) {
        if (col === 'id') state.eqId = val;
        return chain;
      },
      lt(col, val) {
        state.ltField = col;
        state.ltValue = val;
        return chain;
      },
      select() {
        // .select() after .from() just marks read mode (already set);
        // .select() after .delete() marks "return deleted rows" — either
        // way, resolving happens via .then()/await, so just return chain.
        return chain;
      },
      maybeSingle() {
        return chain;
      },
      upsert(obj) {
        state.mode = 'upsert';
        state.upsertRow = obj;
        return chain;
      },
      delete() {
        state.mode = 'delete';
        return chain;
      },
      // Makes `await builder` work regardless of which methods were
      // chained first — resolves based on accumulated state.
      then(resolve) {
        if (state.mode === 'select') {
          const row = state.eqId != null ? rows.get(state.eqId) ?? null : null;
          resolve({ data: row, error: null });
        } else if (state.mode === 'upsert') {
          rows.set(state.upsertRow.id, { ...state.upsertRow });
          resolve({ error: null });
        } else if (state.mode === 'delete') {
          const deleted = [];
          if (state.eqId != null) {
            if (rows.has(state.eqId)) {
              deleted.push({ id: state.eqId });
              rows.delete(state.eqId);
            }
          } else if (state.ltField) {
            for (const [id, row] of [...rows.entries()]) {
              if (row[state.ltField] < state.ltValue) {
                deleted.push({ id });
                rows.delete(id);
              }
            }
          }
          resolve({ data: deleted, error: null });
        } else {
          resolve({ data: null, error: null });
        }
      },
    };
    return chain;
  }


  return {
    _rows: rows, // exposed for tests that want to inspect/seed state directly
    from() {
      return builder('select');
    },
  };
}


function freshStore(options = {}) {
  const mockSupabase = createMockSupabase();
  const store = createSessionStore({ ...options, supabaseClient: mockSupabase });
  return { store, mockSupabase };
}


describe('createSessionStore — isolation', () => {
  test('each call creates an independent store (separate mock backends)', async () => {
    const { store: storeA } = freshStore();
    const { store: storeB, mockSupabase: mockB } = freshStore();
    await storeA.getSession('shared-id');
    await storeA.saveSession('shared-id', { history: [], currentTopic: 'housing', currentEmirate: null, topicTurns: 1 });
    // storeB's backend never saw storeA's write — separate mocks, separate data.
    expect(mockB._rows.has('shared-id')).toBe(false);
  });


  test('two sessions with different IDs in the same store are independent', async () => {
    const { store } = freshStore();
    const s1 = await store.getSession('user-1');
    const s2 = await store.getSession('user-2');
    s1.currentTopic = 'housing';
    expect(s2.currentTopic).toBeNull();
  });
});


describe('getSession', () => {
  test('creates a fresh session with expected default shape when no row exists', async () => {
    const { store } = freshStore();
    const s = await store.getSession('new-user');
    expect(s).toMatchObject({
      history: [],
      currentTopic: null,
      currentEmirate: null,
      topicChanged: false,
      topicTurns: 0,
    });
    expect(typeof s.lastActivity).toBe('number');
  });


  test('returns saved values on a subsequent call after saveSession', async () => {
    const { store } = freshStore();
    const first = await store.getSession('user-1');
    first.currentTopic = 'business';
    first.topicTurns = 1;
    await store.saveSession('user-1', first);


    // AUDIT NOTE: unlike the old in-memory version, this is NOT the same
    // object reference — getSession rebuilds a fresh object from the
    // persisted row every call. Testing value equality, not identity,
    // which is the correct contract for a persisted store.
    const second = await store.getSession('user-1');
    expect(second.currentTopic).toBe('business');
    expect(second).not.toBe(first);
  });


  test('mutating the returned object without calling saveSession does NOT persist', async () => {
    const { store } = freshStore();
    const first = await store.getSession('user-1');
    first.currentTopic = 'business';
    // Deliberately not calling saveSession here.
    const second = await store.getSession('user-1');
    expect(second.currentTopic).toBeNull();
  });
});


describe('addToHistory', () => {
  test('appends a message to the in-memory session object', async () => {
    const { store } = freshStore();
    const s = await store.getSession('user-1');
    store.addToHistory(s, 'user', 'Hello');
    expect(s.history).toEqual([{ role: 'user', content: 'Hello' }]);
  });


  test('trims history beyond maxTurns * 2 entries', async () => {
    const { store } = freshStore({ maxTurns: 2 }); // cap = 4 entries
    const s = await store.getSession('user-1');
    for (let i = 0; i < 10; i++) {
      store.addToHistory(s, i % 2 === 0 ? 'user' : 'assistant', `msg${i}`);
    }
    expect(s.history.length).toBe(4);
    expect(s.history[0].content).toBe('msg6');
    expect(s.history[3].content).toBe('msg9');
  });


  test('respects a custom maxTurns option', async () => {
    const { store } = freshStore({ maxTurns: 1 }); // cap = 2 entries
    const s = await store.getSession('user-1');
    for (let i = 0; i < 5; i++) store.addToHistory(s, 'user', `m${i}`);
    expect(s.history.length).toBe(2);
  });


  test('history persists correctly through a full get -> mutate -> save -> get cycle', async () => {
    const { store } = freshStore();
    const s = await store.getSession('user-1');
    store.addToHistory(s, 'user', 'Hello');
    store.addToHistory(s, 'assistant', 'Hi there');
    await store.saveSession('user-1', s);


    const reloaded = await store.getSession('user-1');
    expect(reloaded.history).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ]);
  });
});


describe('deleteSession', () => {
  test('removes a session by ID and returns true', async () => {
    const { store } = freshStore();
    const s = await store.getSession('to-delete');
    await store.saveSession('to-delete', s);


    const result = await store.deleteSession('to-delete');
    expect(result).toBe(true);


    const after = await store.getSession('to-delete');
    expect(after.history).toEqual([]); // back to a fresh default, row is gone
  });


  test('returns false when deleting a session that was never saved', async () => {
    const { store } = freshStore();
    const result = await store.deleteSession('never-existed');
    expect(result).toBe(false);
  });
});


describe('cleanupExpired', () => {
  test('removes sessions older than the TTL and keeps recent ones', async () => {
    const { store, mockSupabase } = freshStore({ ttlMs: 1000 }); // 1s TTL


    const old = await store.getSession('old-user');
    await store.saveSession('old-user', old);
    const fresh = await store.getSession('fresh-user');
    await store.saveSession('fresh-user', fresh);


    // Directly backdate the mock's stored last_activity — simulating an
    // old session without waiting on real timers.
    const oldRow = mockSupabase._rows.get('old-user');
    oldRow.last_activity = new Date(Date.now() - 5000).toISOString();


    const removed = await store.cleanupExpired();
    expect(removed).toBe(1);


    const afterOld = await store.getSession('old-user');
    expect(afterOld.history).toEqual([]); // gone, back to default
    const afterFresh = await store.getSession('fresh-user');
    expect(afterFresh.currentTopic).toBe(fresh.currentTopic); // still there
  });


  test('removes nothing when all sessions are within TTL', async () => {
    const { store } = freshStore({ ttlMs: DEFAULT_TTL_MS });
    const s1 = await store.getSession('user-1');
    await store.saveSession('user-1', s1);
    const s2 = await store.getSession('user-2');
    await store.saveSession('user-2', s2);
    expect(await store.cleanupExpired()).toBe(0);
  });


  test('does not throw and returns 0 on an empty store', async () => {
    const { store } = freshStore();
    expect(await store.cleanupExpired()).toBe(0);
  });
});


describe('defaults', () => {
  test('uses DEFAULT_MAX_TURNS when no option is passed', () => {
    const { store } = freshStore();
    expect(store.maxTurns).toBe(DEFAULT_MAX_TURNS);
  });


  test('uses DEFAULT_TTL_MS when no option is passed', () => {
    const { store } = freshStore();
    expect(store.ttlMs).toBe(DEFAULT_TTL_MS);
  });
});


// AUDIT NOTE: this is the exact scenario that broke pr-checks.yml's Boot
// Smoke job in CI — no Supabase env vars configured, supabaseClient.js
// exports supabase: null, and every method here needs to degrade
// gracefully rather than throw. Permanent regression guard so this
// doesn't silently break again.
describe('graceful degradation when Supabase is not configured (client is null)', () => {
  test('getSession returns a fresh session, does not throw', async () => {
    const store = createSessionStore({ supabaseClient: null });
    const s = await store.getSession('any-id');
    expect(s).toMatchObject({
      history: [],
      currentTopic: null,
      currentEmirate: null,
      topicChanged: false,
      topicTurns: 0,
    });
  });


  test('saveSession resolves without throwing', async () => {
    const store = createSessionStore({ supabaseClient: null });
    const s = await store.getSession('any-id');
    await expect(store.saveSession('any-id', s)).resolves.toBeUndefined();
  });


  test('deleteSession returns false, does not throw', async () => {
    const store = createSessionStore({ supabaseClient: null });
    expect(await store.deleteSession('any-id')).toBe(false);
  });


  test('cleanupExpired returns 0, does not throw', async () => {
    const store = createSessionStore({ supabaseClient: null });
    expect(await store.cleanupExpired()).toBe(0);
  });
});


