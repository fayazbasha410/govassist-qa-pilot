// ─────────────────────────────────────────
// SESSION / MULTI-TURN MEMORY — Supabase-backed
//
// REPLACES the in-memory Map version (v3.8.0–v3.13.0) as of this round's
// Supabase epic. Hard cutover, not hybrid — see project status doc, Part 4,
// for why: a dual in-memory + persisted source of truth is exactly the
// "convenient shortcut that seems harmless" pattern that caused the
// shared-'default'-session bug and several other real bugs found and
// fixed in v3.13.0. One source of truth, one thing to get right.
//
// ARCHITECTURAL NOTE — this is NOT a drop-in swap for the old factory,
// and callers in server.js need real changes, not just a require() swap:
//   - getSession() is now ASYNC (network round-trip). Every call site
//     needs `await`.
//   - Mutations to the returned session object during a request (setting
//     .currentTopic, calling addToHistory, etc.) still happen SYNCHRONOUSLY
//     on the in-memory object, exactly as before — nothing changes there.
//   - Persistence is now an EXPLICIT step: call saveSession(sessionId,
//     session) once, at the end of request handling, after all in-memory
//     mutations for this turn are done. This batches the whole turn into
//     one write instead of many round trips.
//   - deleteSession() and cleanupExpired() are now ASYNC too.
//
// TESTING NOTE: the old factory's "fresh isolated store per test" pattern
// doesn't map cleanly onto a real shared database. This factory accepts
// an injected Supabase client so unit tests can pass a mock instead of
// hitting a real database — tests/unit/lib/session.test.js will need
// real updates to mock the client, not just re-run as-is.
// ─────────────────────────────────────────


// AUDIT NOTE: NOT required at module top-level, deliberately. The real
// Supabase client (via ./supabaseClient) calls createClient(), which
// throws SYNCHRONOUSLY if SUPABASE_URL is missing — confirmed by actually
// running this file's test suite without real env vars set. Unit tests
// are supposed to need zero external credentials (see the project's own
// "zero Groq quota, no network" convention for npm run test:unit) — an
// eager top-level require here would crash the entire suite, not just
// this file's tests, the moment ANY test imported session.js in an
// environment without real Supabase credentials. Required lazily instead,
// only when no mock client is injected via options.supabaseClient.


const DEFAULT_MAX_TURNS = 6;
const DEFAULT_TTL_MS = 30 * 60 * 1000;


function createSessionStore(options = {}) {
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const supabase = 'supabaseClient' in options
    ? options.supabaseClient
    : require('./supabaseClient').supabase;


  function rowToSession(row) {
    return {
      history: row.history ?? [],
      currentTopic: row.current_topic ?? null,
      currentEmirate: row.current_emirate ?? null,
      // topicChanged is deliberately NOT persisted — it's recomputed
      // fresh every turn from priorTopic vs incomingTopic in server.js,
      // never read back from a stored value. Always starts false on load;
      // server.js overwrites it before it's ever used.
      topicChanged: false,
      topicTurns: row.topic_turns ?? 0,
      lastActivity: row.last_activity ? new Date(row.last_activity).getTime() : Date.now(),
    };
  }


  function freshSession() {
    return {
      history: [],
      currentTopic: null,
      currentEmirate: null,
      topicChanged: false,
      topicTurns: 0,
      lastActivity: Date.now(),
    };
  }


  async function getSession(sessionId) {
    if (!supabase) return freshSession();


    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();


    if (error) {
      console.error('⚠️ getSession Supabase error:', error.message);
      // Fail open to a fresh in-memory-only session rather than crash the
      // request — a degraded (non-persistent) session is better than a
      // hard failure for the user, but this IS a real problem worth
      // monitoring, not silently fine.
      return freshSession();
    }


    return data ? rowToSession(data) : freshSession();
  }


  // Unchanged from the old in-memory version — still purely synchronous,
  // still just mutates the in-memory object. Persistence happens later,
  // explicitly, via saveSession().
  function addToHistory(session, role, content) {
    session.history.push({ role, content });
    if (session.history.length > maxTurns * 2) {
      session.history = session.history.slice(-maxTurns * 2);
    }
  }


  // NEW — the explicit persistence step. Call once per request, after all
  // in-memory mutations for this turn are done, right before sending the
  // response. userId is optional and nullable — anonymous chat sessions
  // remain fully supported; linking a session to a logged-in user is a
  // separate, later step in the auth epic, not assumed here.
  async function saveSession(sessionId, session, userId = null) {
    if (!supabase) return;


    const { error } = await supabase
      .from('chat_sessions')
      .upsert({
        id: sessionId,
        user_id: userId,
        current_topic: session.currentTopic,
        current_emirate: session.currentEmirate,
        topic_turns: session.topicTurns,
        history: session.history,
        last_activity: new Date().toISOString(),
      });


    if (error) {
      // Same fail-open philosophy as getSession — log loudly, don't crash
      // the response the user is waiting on.
      console.error('⚠️ saveSession Supabase error:', error.message);
    }
  }


  async function deleteSession(sessionId) {
    if (!supabase) return false;


    // .select('id') on a delete returns the rows that were actually
    // deleted — needed because Supabase's delete() succeeds silently even
    // when zero rows matched, and callers reasonably expect to know
    // whether a session actually existed.
    const { data, error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .select('id');


    if (error) {
      console.error('⚠️ deleteSession Supabase error:', error.message);
      return false;
    }
    return (data?.length ?? 0) > 0;
  }


  // Removes sessions inactive longer than the TTL. Returns the number
  // removed, same contract as the old in-memory version.
  async function cleanupExpired() {
    if (!supabase) return 0;


    const cutoff = new Date(Date.now() - ttlMs).toISOString();
    const { data, error } = await supabase
      .from('chat_sessions')
      .delete()
      .lt('last_activity', cutoff)
      .select('id');


    if (error) {
      console.error('⚠️ cleanupExpired Supabase error:', error.message);
      return 0;
    }
    return data?.length ?? 0;
  }


  // startCleanupInterval can't await inside setInterval's callback — fire
  // and forget, with error handling already inside cleanupExpired itself.
  function startCleanupInterval(intervalMs = 10 * 60 * 1000) {
    return setInterval(() => {
      cleanupExpired().catch(err =>
        console.error('⚠️ Cleanup interval error:', err.message)
      );
    }, intervalMs);
  }


  return {
    maxTurns,
    ttlMs,
    getSession,
    addToHistory,
    saveSession,
    deleteSession,
    cleanupExpired,
    startCleanupInterval,
  };
}


module.exports = { createSessionStore, DEFAULT_MAX_TURNS, DEFAULT_TTL_MS };


