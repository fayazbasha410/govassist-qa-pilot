// Centralised API client — all API calls go through here
// Specs never hardcode URLs or fetch logic — they call this client
// This means if an endpoint changes, we fix it in ONE place

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class GovAssistApiClient {
  constructor(request) {
    // request = Playwright's APIRequestContext
    this.request = request;
    this.baseUrl = BASE_URL;
  }

  // ── Health ─────────────────────────────────────────────
  async getHealth() {
    const res = await this.request.get(`${this.baseUrl}/api/health`);
    return { status: res.status(), body: await res.json() };
  }

  // ── Policies ───────────────────────────────────────────
  async searchPolicies(query) {
    const res = await this.request.get(
      `${this.baseUrl}/api/policies/search?q=${encodeURIComponent(query)}`
    );
    return { status: res.status(), body: await res.json() };
  }

  async searchPoliciesRaw() {
    // No query param — should return 400
    const res = await this.request.get(`${this.baseUrl}/api/policies/search`);
    return { status: res.status(), body: await res.json() };
  }

  // ── Fines ──────────────────────────────────────────────
  async getFines(plateNumber) {
    const res = await this.request.get(
      `${this.baseUrl}/api/tools/fines/${plateNumber}`
    );
    return { status: res.status(), body: await res.json() };
  }

  // ── Appointments ───────────────────────────────────────
  async bookAppointment(service, date) {
    const res = await this.request.post(
      `${this.baseUrl}/api/tools/appointment`,
      { data: { service, date } }
    );
    return { status: res.status(), body: await res.json() };
  }

  async bookAppointmentRaw(payload) {
    // Accepts any payload — for negative/schema tests
    const res = await this.request.post(
      `${this.baseUrl}/api/tools/appointment`,
      { data: payload }
    );
    return { status: res.status(), body: await res.json() };
  }

  // ── Chat ───────────────────────────────────────────────
  async sendChat(message) {
    const res = await this.request.post(
      `${this.baseUrl}/api/chat`,
      { data: { message } }
    );
    return { status: res.status(), body: await res.json() };
  }

  async sendChatRaw(payload) {
    // Accepts any payload — for negative tests
    const res = await this.request.post(
      `${this.baseUrl}/api/chat`,
      { data: payload }
    );
    return { status: res.status(), body: await res.json() };
  }
}

module.exports = { GovAssistApiClient };