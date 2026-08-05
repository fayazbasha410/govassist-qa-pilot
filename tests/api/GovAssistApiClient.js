// ─────────────────────────────────────────────────────────────────────────────
// GovMurshid — API Client
// All API calls go through here. Specs never hardcode URLs or fetch logic.
// ─────────────────────────────────────────────────────────────────────────────


const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';


class GovAssistApiClient {
  // AUDIT NOTE (this round): defaultSessionId is set by the `api` fixture in
  // fixtures/fixtures.js to a per-test unique value. This exists because
  // src/server.js falls back to a single shared session key ('default')
  // whenever a /api/chat request omits sessionId — and the vast majority of
  // existing test calls (chat.spec.js, appointments.spec.js, etc.) call
  // sendChat()/sendConversation() without ever passing one. Before this fix,
  // every one of those calls was silently reading/writing the SAME in-memory
  // session object. That was tolerable only because playwright.config.js ran
  // everything serially (workers: 1, fullyParallel: false); now that CI runs
  // workers: 3, concurrent files can race on that same shared session. This
  // is the exact class of bug already found and fixed in production
  // (v3.11.0) and in promptfoo.yaml — the test suite had the same exposure
  // and just hadn't hit it yet.
  constructor(request, defaultSessionId = null) {
    this.request = request;
    this.baseUrl = BASE_URL;
    this.defaultSessionId = defaultSessionId;
  }


  // ── Health ──────────────────────────────────────────────────────────────────
  async getHealth() {
    const res = await this.request.get(`${this.baseUrl}/api/health`);
    return { status: res.status(), body: await res.json() };
  }


  // ── Policies ────────────────────────────────────────────────────────────────
  async searchPolicies(query) {
    const res = await this.request.get(
      `${this.baseUrl}/api/policies/search?q=${encodeURIComponent(query)}`
    );
    return { status: res.status(), body: await res.json() };
  }


  async searchPoliciesRaw(queryString = '') {
    const url = queryString
      ? `${this.baseUrl}/api/policies/search?${queryString}`
      : `${this.baseUrl}/api/policies/search`;
    const res = await this.request.get(url);
    return { status: res.status(), body: await res.json() };
  }


  // ── Fines ───────────────────────────────────────────────────────────────────
  async getFines(plateNumber) {
    const res = await this.request.get(
      `${this.baseUrl}/api/tools/fines/${plateNumber}`
    );
    return { status: res.status(), body: await res.json() };
  }


  // ── Appointments ─────────────────────────────────────────────────────────────
  async bookAppointment(service, date) {
    const res = await this.request.post(
      `${this.baseUrl}/api/tools/appointment`,
      { data: { service, date } }
    );
    return { status: res.status(), body: await res.json() };
  }


  async bookAppointmentRaw(payload) {
    const res = await this.request.post(
      `${this.baseUrl}/api/tools/appointment`,
      { data: payload }
    );
    return { status: res.status(), body: await res.json() };
  }


  // ── Chat ─────────────────────────────────────────────────────────────────────
  async sendChat(message, sessionId = null) {
    const effectiveSessionId = sessionId || this.defaultSessionId;
    const payload = { message };
    if (effectiveSessionId) payload.sessionId = effectiveSessionId;
    const res = await this.request.post(
      `${this.baseUrl}/api/chat`,
      { data: payload }
    );
    return { status: res.status(), body: await res.json() };
  }


  // NOTE: intentionally does NOT apply defaultSessionId — this method exists
  // for tests that need full, unmodified control over the payload (e.g.
  // malformed-input / validation tests). Use sendChat() for anything that
  // should be session-isolated.
  async sendChatRaw(payload) {
    const res = await this.request.post(
      `${this.baseUrl}/api/chat`,
      { data: payload }
    );
    return { status: res.status(), body: await res.json() };
  }


  // ── Session ──────────────────────────────────────────────────────────────────
  async clearSession(sessionId) {
    const res = await this.request.post(
      `${this.baseUrl}/api/session/clear`,
      { data: { sessionId } }
    );
    return { status: res.status(), body: await res.json() };
  }


  // ── Multi-turn conversation helper ───────────────────────────────────────────
  // Sends multiple messages in sequence with the same sessionId
  // Returns array of responses
  async sendConversation(messages, sessionId = null) {
    const responses = [];
    for (const message of messages) {
      const response = await this.sendChat(message, sessionId);
      responses.push(response);
    }
    return responses;
  }
}


module.exports = { GovAssistApiClient };