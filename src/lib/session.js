// ─────────────────────────────────────────
// SESSION / MULTI-TURN MEMORY
// Extracted from server.js (v3.8.0) for unit testability.
//
// Exposed as a factory (createSessionStore) rather than a singleton Map,
// so tests can create fresh, isolated stores instead of sharing state
// across test cases. server.js creates exactly one store instance at
// startup and uses it for the lifetime of the process — same runtime
// behavior as before, just relocated.
// ─────────────────────────────────────────


const DEFAULT_MAX_TURNS = 6;
const DEFAULT_TTL_MS = 30 * 60 * 1000;


function createSessionStore(options = {}) {
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const sessions = new Map();


  function getSession(sessionId) {
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {
        history: [],
        currentTopic: null,
        currentEmirate: null,
        topicChanged: false,
        topicTurns: 0,
        lastActivity: Date.now(),
      });
    }
    const session = sessions.get(sessionId);
    session.lastActivity = Date.now();
    return session;
  }


  function addToHistory(session, role, content) {
    session.history.push({ role, content });
    if (session.history.length > maxTurns * 2) {
      session.history = session.history.slice(-maxTurns * 2);
    }
  }


  function deleteSession(sessionId) {
    return sessions.delete(sessionId);
  }


  // Removes sessions inactive longer than the TTL. Returns the number
  // removed (useful for tests — the running server doesn't need the
  // return value, it just calls this on an interval).
  function cleanupExpired(now = Date.now()) {
    let removed = 0;
    for (const [id, session] of sessions.entries()) {
      if (now - session.lastActivity > ttlMs) {
        sessions.delete(id);
        removed++;
      }
    }
    return removed;
  }


  // Starts the periodic cleanup interval for a live server. Not used in
  // unit tests — tests call cleanupExpired() directly with a controlled
  // 'now' value instead of waiting on real timers.
  function startCleanupInterval(intervalMs = 10 * 60 * 1000) {
    return setInterval(() => cleanupExpired(), intervalMs);
  }


  return {
    sessions,
    maxTurns,
    ttlMs,
    getSession,
    addToHistory,
    deleteSession,
    cleanupExpired,
    startCleanupInterval,
  };
}


module.exports = { createSessionStore, DEFAULT_MAX_TURNS, DEFAULT_TTL_MS };