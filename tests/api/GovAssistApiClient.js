// ─────────────────────────────────────────────────────────────────────────────
// GovMurshid — API Client
// All API calls go through here. Specs never hardcode URLs or fetch logic.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class GovAssistApiClient {
  constructor(request) {
    this.request = request;
    this.baseUrl = BASE_URL;
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
    const payload = { message };
    if (sessionId) payload.sessionId = sessionId;
    const res = await this.request.post(
      `${this.baseUrl}/api/chat`,
      { data: payload }
    );
    return { status: res.status(), body: await res.json() };
  }

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
  async sendConversation(messages, sessionId) {
    const responses = [];
    for (const message of messages) {
      const response = await this.sendChat(message, sessionId);
      responses.push(response);
    }
    return responses;
  }
}

module.exports = { GovAssistApiClient };