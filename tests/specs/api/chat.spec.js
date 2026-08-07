// ─────────────────────────────────────────────────────────────────────────────
// TC_CHAT — Chat API Tests
// Covers: validation, guardrails, RAG, tools, memory, Arabic, all 7 emirates,
//         response time, edge cases
// ─────────────────────────────────────────────────────────────────────────────


const { test, expect } = require('../../fixtures/fixtures');
const {
  GUARDRAIL_INPUTS, CHAT_MESSAGES, EN, AR, RESPONSE_TIMES
} = require('../../data/testData');
const {
  assertChatResponseSchema,
  assertArabicResponse,
  assertEnglishResponse,
  assertMemorySchema,
  assertPolicyInResults,
  measureTime,
  assertResponseTime,
  containsArabic
} = require('../../helpers/testHelpers');


// Groq free tier on VPN can be slow — use generous timeouts
const LLM_TIMEOUT = 60000;
const TOOL_TIMEOUT = 10000;


function newSessionId() {
  return `test_sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}


test.describe('Chat API', () => {


  // ── Input Validation ────────────────────────────────────────────────────────
  test('[TC_CHAT_001] returns 400 for missing message field', async ({ api }) => {
    const { status } = await api.sendChatRaw({});
    expect(status).toBe(400);
  });


  test('[TC_CHAT_002] returns 400 for non-string message', async ({ api }) => {
    const { status } = await api.sendChatRaw({ message: 123 });
    expect(status).toBe(400);
  });


  test('[TC_CHAT_003] returns 400 for null message', async ({ api }) => {
    const { status } = await api.sendChatRaw({ message: null });
    expect(status).toBe(400);
  });


  test('[TC_CHAT_004] returns 400 for empty payload', async ({ api }) => {
    const { status } = await api.sendChatRaw({});
    expect(status).toBe(400);
  });


  // ── Schema ──────────────────────────────────────────────────────────────────
  // AUDIT NOTE (this round): TC_CHAT_005-009 originally used
  // CHAT_MESSAGES.drivingLicense, which no longer exists — testData.js had
  // all transport-related keys removed in v3.6.0 (see its own header
  // comment) but this file was never updated to match. undefined silently
  // drops from JSON.stringify, so these were sending message-less requests
  // and failing on the server's 400 validation, not on their actual
  // assertions. Repointed to CHAT_MESSAGES.emiratesId — the assertions
  // themselves (schema shape, sessionId echo, topicChanged type, language
  // field) are generic and don't depend on which real topic is asked about.
  test('[TC_CHAT_005] response always matches schema', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.emiratesId);
    assertChatResponseSchema(body);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_006] response includes sessionId when provided', async ({ api }) => {
    const sid = newSessionId();
    const { body } = await api.sendChat(CHAT_MESSAGES.emiratesId, sid);
    expect(body.sessionId).toBe(sid);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_007] response includes topicChanged as boolean', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.emiratesId);
    expect(typeof body.topicChanged).toBe('boolean');
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_008] language field is en for English messages', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.emiratesId);
    assertEnglishResponse(body);
  }, { timeout: LLM_TIMEOUT });


  // ── RAG — Core Services ─────────────────────────────────────────────────────
  // TC_CHAT_009 (driving license / POL-001) retired — transport moved to
  // Tawfeer in v3.6.0, no driving policy exists to retrieve anymore. Core
  // service RAG coverage remains via TC_CHAT_010-013 below.


  test('[TC_CHAT_010] health insurance question returns healthcare docs', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.healthcare);
    expect(body.guardrail.triggered).toBe(false);
    expect(body.retrievedDocs.length).toBeGreaterThan(0);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_011] Ejari housing question returns POL-018', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.housing);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.ejari_dubai);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_012] school enrollment question returns education docs', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.education);
    expect(body.guardrail.triggered).toBe(false);
    expect(body.retrievedDocs.length).toBeGreaterThan(0);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_013] Golden Visa question returns POL-035', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.goldenVisa);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.golden_visa);
  }, { timeout: LLM_TIMEOUT });


  // ── RAG — All 7 Emirates: Driving License ──────────────────────────────────
  // TC_CHAT_014-020 retired — tested driving-license policies (Abu Dhabi
  // TAMM, Dubai RTA, and POL-036/041/045/048/052 for the remaining
  // emirates) that no longer exist since transport moved to Tawfeer in
  // v3.6.0. Per-emirate RAG coverage remains via the health-insurance and
  // school-enrollment blocks below (TC_CHAT_021-028).


  // ── RAG — All 7 Emirates: Health Insurance ─────────────────────────────────
  test('[TC_CHAT_021] health insurance Sharjah returns POL-037 and mentions mandatory', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.healthSharjah);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.health_sharjah);
    expect(body.reply).toContain(EN.health_mandatory);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_022] health insurance Ajman returns POL-042', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.healthAjman);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.health_ajman);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_023] health insurance RAK returns POL-049', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.healthRAK);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.health_rak);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_024] health insurance Fujairah returns POL-053', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.healthFujairah);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.health_fujairah);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_025] health insurance UAQ returns POL-046', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.healthUAQ);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.health_uaq);
  }, { timeout: LLM_TIMEOUT });


  // ── RAG — School Enrollment Northern Emirates ───────────────────────────────
  test('[TC_CHAT_026] school enrollment Fujairah returns POL-054', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.schoolFujairah);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.school_fujairah);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_027] school enrollment RAK returns POL-050', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.schoolRAK);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.school_rak);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_028] school enrollment Ajman returns POL-043', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.schoolAjman);
    expect(body.guardrail.triggered).toBe(false);
    assertPolicyInResults(body.retrievedDocs, EN.policy_ids.school_ajman);
  }, { timeout: LLM_TIMEOUT });


  // ── Tool Calls ──────────────────────────────────────────────────────────────
  // TC_CHAT_029/030 retired — checkFineStatus was removed from
  // TOOL_DEFINITIONS entirely (server.js only defines bookAppointment now),
  // so a fine-check message can never trigger a tool call via chat anymore.
  // The stub itself is still tested directly via fines.spec.js
  // (TC_FINE_001/002) against the dedicated REST endpoint.


  test('[TC_CHAT_031] appointment booking returns bookAppointment tool', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.bookAppointment);
    expect(body.toolUsed).not.toBeNull();
    expect(body.toolUsed.name).toBe('bookAppointment');
  }, { timeout: TOOL_TIMEOUT });


  test('[TC_CHAT_032] appointment reply contains TAMM confirmation prefix', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.bookAppointment);
    expect(body.reply).toContain(EN.appointment_prefix);
  }, { timeout: TOOL_TIMEOUT });


  // AUDIT NOTE (this round): TC_CHAT_033/034 originally used the now-
  // undefined CHAT_MESSAGES.finePlate. Repointed to bookAppointment (the
  // one tool that still exists via chat) rather than retiring — their
  // actual intent (tool responses have empty retrievedDocs; tool responses
  // set language correctly) is a real, still-relevant contract, distinct
  // from what TC_CHAT_031/032 check (tool name and reply content).
  test('[TC_CHAT_033] tool response has empty retrievedDocs array', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.bookEmiratesId);
    expect(body.retrievedDocs).toHaveLength(0);
  }, { timeout: TOOL_TIMEOUT });


  test('[TC_CHAT_034] tool response language is en for English booking', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.bookEmiratesId);
    expect(body.language).toBe('en');
  }, { timeout: TOOL_TIMEOUT });


  // ── Guardrails — English Prompt Injection ───────────────────────────────────
  test.describe('Guardrails — English prompt injection', () => {
    for (const [i, input] of GUARDRAIL_INPUTS.promptInjection.entries()) {
      test(`[TC_CHAT_035_${i + 1}] blocks injection: "${input.slice(0, 40)}..."`, async ({ api }) => {
        const { body } = await api.sendChat(input);
        expect(body.guardrail.triggered).toBe(true);
        expect(body.guardrail.reason).toBe(EN.guardrail_reason_injection);
        expect(body.reply).toContain(EN.guardrail_injection);
        expect(body.retrievedDocs).toHaveLength(0);
      });
    }
  });


  // ── Guardrails — English Off Topic ─────────────────────────────────────────
  test.describe('Guardrails — English off topic', () => {
    for (const [i, input] of GUARDRAIL_INPUTS.offTopic.entries()) {
      test(`[TC_CHAT_036_${i + 1}] blocks off-topic: "${input}"`, async ({ api }) => {
        const { body } = await api.sendChat(input);
        expect(body.guardrail.triggered).toBe(true);
        expect(body.guardrail.reason).toBe(EN.guardrail_reason_off_topic);
        expect(body.reply).toContain(EN.guardrail_off_topic);
      });
    }
  });


  // ── Guardrails — Arabic Prompt Injection ────────────────────────────────────
  test.describe('Guardrails — Arabic prompt injection', () => {
    for (const [i, input] of GUARDRAIL_INPUTS.arabicPromptInjection.entries()) {
      test(`[TC_CHAT_037_${i + 1}] blocks Arabic injection`, async ({ api }) => {
        const { body } = await api.sendChat(input);
        expect(body.guardrail.triggered).toBe(true);
        expect(body.guardrail.reason).toBe(EN.guardrail_reason_injection);
        expect(containsArabic(body.reply)).toBe(true);
      });
    }
  });


  // ── Guardrails — Arabic Off Topic ──────────────────────────────────────────
  test.describe('Guardrails — Arabic off topic', () => {
    for (const [i, input] of GUARDRAIL_INPUTS.arabicOffTopic.entries()) {
      test(`[TC_CHAT_038_${i + 1}] blocks Arabic off-topic`, async ({ api }) => {
        const { body } = await api.sendChat(input);
        expect(body.guardrail.triggered).toBe(true);
        expect(body.guardrail.reason).toBe(EN.guardrail_reason_off_topic);
      });
    }
  });


  // ── Guardrails — Legitimate messages NOT blocked ────────────────────────────
  test.describe('Guardrails — legitimate messages pass through', () => {
    for (const [i, input] of GUARDRAIL_INPUTS.legitimate.entries()) {
      test(`[TC_CHAT_039_${i + 1}] does not block: "${input}"`, async ({ api }) => {
        const { body } = await api.sendChat(input);
        expect(body.guardrail.triggered).toBe(false);
      }, { timeout: LLM_TIMEOUT });
    }
  });


  // ── Arabic Language Support ─────────────────────────────────────────────────
  // TC_CHAT_040 (Arabic driving license) retired — same reason as the
  // English driving block above.


  test('[TC_CHAT_041] Arabic health insurance Sharjah returns Arabic reply with Sharjah docs', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.arabicHealthSharjah);
    assertArabicResponse(body);
    expect(body.guardrail.triggered).toBe(false);
    // Arabic translation may retrieve different but related policies — check docs exist
    expect(body.retrievedDocs.length).toBeGreaterThan(0);
  }, { timeout: LLM_TIMEOUT });


  // AUDIT NOTE (this round): originally used the now-undefined
  // CHAT_MESSAGES.arabicFineCheck (fine-check tool calling is gone from
  // chat entirely, see TC_CHAT_029/030's retirement note above).
  //
  // Repointed to arabicBookAppointment — but discovered while fixing this
  // that it will NOT actually exercise the tool path: server.js's
  // BOOKING_KEYWORDS pre-check ('book', 'appointment', 'schedule',
  // 'reserve', 'slot') is English-only, so an Arabic booking message never
  // triggers detectToolIntentWithLLM at all and falls through to the RAG
  // path instead. That's a real, separate gap — Arabic tool-calling
  // appears structurally unreachable right now — flagged here rather than
  // silently asserted around. This test checks what's actually true today
  // (Arabic input still gets a valid Arabic reply); it does NOT assert
  // toolUsed, to avoid the test lying about a feature that doesn't work.
  test('[TC_CHAT_042] Arabic appointment request returns a valid Arabic reply', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.arabicBookAppointment);
    expect(body.language).toBe('ar');
    expect(containsArabic(body.reply)).toBe(true);
    expect(body.guardrail.triggered).toBe(false);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_043] Arabic Golden Visa returns Arabic reply', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.arabicGoldenVisa);
    assertArabicResponse(body);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_044] Arabic Ejari question returns Arabic reply with housing docs', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.arabicEjari);
    expect(body.language).toBe('ar');
    expect(containsArabic(body.reply)).toBe(true);
    // Arabic RAG retrieves docs even if translation shifts the exact policy
    expect(body.retrievedDocs.length).toBeGreaterThan(0);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_045] Arabic school enrollment Dubai returns Arabic reply', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.arabicSchoolDubai);
    assertArabicResponse(body);
  }, { timeout: LLM_TIMEOUT });


  // TC_CHAT_046 (Arabic driving license Dubai) retired — same reason.


  test('[TC_CHAT_047] Arabic Emirates ID returns Arabic reply', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.arabicEmiratesId);
    assertArabicResponse(body);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_048] Arabic health insurance Dubai returns Arabic reply', async ({ api }) => {
    const { body } = await api.sendChat(CHAT_MESSAGES.arabicHealthInsurance);
    assertArabicResponse(body);
  }, { timeout: LLM_TIMEOUT });


  // ── Multi-Turn Memory ───────────────────────────────────────────────────────
  test('[TC_CHAT_049] session ID echoed back correctly', async ({ api }) => {
    const sid = newSessionId();
    const { body } = await api.sendChat(CHAT_MESSAGES.emiratesId, sid);
    expect(body.sessionId).toBe(sid);
    assertMemorySchema(body);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_050] first message has topicChanged as false', async ({ api }) => {
    const sid = newSessionId();
    const { body } = await api.sendChat(CHAT_MESSAGES.emiratesId, sid);
    expect(body.topicChanged).toBe(false);
  }, { timeout: LLM_TIMEOUT });


  // AUDIT NOTE (this round): originally switched from healthSharjah to the
  // now-undefined drivingLicense. Repointed to goldenVisa — confirmed via
  // textDetection.js's TOPIC_GROUPS that 'insurance' (health) and 'visa'
  // (golden visa, emirates id) are genuinely separate groups, so this still
  // tests a real cross-topic switch, not just a content swap.
  test('[TC_CHAT_051] switching from insurance to visa triggers topicChanged true', async ({ api }) => {
    const sid = newSessionId();
    await api.sendChat(CHAT_MESSAGES.healthSharjah, sid);
    const { body } = await api.sendChat(CHAT_MESSAGES.goldenVisa, sid);
    expect(body.topicChanged).toBe(true);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_052] follow-up stays in same topic — topicChanged is false', async ({ api }) => {
    const sid = newSessionId();
    await api.sendChat(CHAT_MESSAGES.healthSharjah, sid);
    const { body } = await api.sendChat(CHAT_MESSAGES.followUpDubai, sid);
    expect(body.topicChanged).toBe(false);
    expect(body.guardrail.triggered).toBe(false);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_053] follow-up Dubai after Sharjah health insurance mentions Dubai', async ({ api }) => {
    const sid = newSessionId();
    await api.sendChat(CHAT_MESSAGES.healthSharjah, sid);
    const { body } = await api.sendChat(CHAT_MESSAGES.followUpDubai, sid);
    expect(body.guardrail.triggered).toBe(false);
    expect(body.reply.toLowerCase()).toContain('dubai');
  }, { timeout: LLM_TIMEOUT });


  // TC_CHAT_054 (direct Ajman driving license) retired — driving content
  // gone, and this duplicated TC_CHAT_017's coverage anyway (also retired).


  test('[TC_CHAT_055] clearing session returns 200', async ({ api }) => {
    const sid = newSessionId();
    await api.sendChat(CHAT_MESSAGES.emiratesId, sid);
    const { status, body } = await api.clearSession(sid);
    expect(status).toBe(200);
    expect(body.cleared).toBe(true);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_056] after session clear topic change is false on new message', async ({ api }) => {
    const sid = newSessionId();
    await api.sendChat(CHAT_MESSAGES.healthSharjah, sid);
    await api.clearSession(sid);
    const { body } = await api.sendChat(CHAT_MESSAGES.emiratesId, sid);
    expect(body.topicChanged).toBe(false);
  }, { timeout: LLM_TIMEOUT });


  // ── Edge Cases ──────────────────────────────────────────────────────────────
  test('[TC_CHAT_057] very long message returns 200 with a reply', async ({ api }) => {
    const { status, body } = await api.sendChat(CHAT_MESSAGES.veryLong);
    expect([200, 400]).toContain(status);
    if (status === 200) {
      expect(typeof body.reply).toBe('string');
      expect(body.reply.length).toBeGreaterThan(0);
    }
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_058] special characters handled gracefully', async ({ api }) => {
    const { status, body } = await api.sendChat(CHAT_MESSAGES.specialChars);
    expect(status).toBe(200);
    expect(typeof body.reply).toBe('string');
    expect(body.reply.length).toBeGreaterThan(0);
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_059] SQL injection attempt handled safely', async ({ api }) => {
    const { status, body } = await api.sendChat(CHAT_MESSAGES.sqlInjection);
    expect(status).toBe(200);
    expect(typeof body.reply).toBe('string');
    expect(body.guardrail).toBeTruthy();
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_060] HTML injection handled safely — reply is a string', async ({ api }) => {
    const { status, body } = await api.sendChat(CHAT_MESSAGES.htmlInjection);
    expect(status).toBe(200);
    expect(typeof body.reply).toBe('string');
  }, { timeout: LLM_TIMEOUT });


  test('[TC_CHAT_061] numbers-only message returns a reply', async ({ api }) => {
    const { status, body } = await api.sendChat(CHAT_MESSAGES.numberOnly);
    expect(status).toBe(200);
    expect(typeof body.reply).toBe('string');
    expect(body.reply.length).toBeGreaterThan(0);
  }, { timeout: LLM_TIMEOUT });


  // ── Response Time ────────────────────────────────────────────────────────────
  // Thresholds are generous to accommodate Groq free tier + VPN latency
  test('[TC_CHAT_062] guardrail response is fast under 2000ms', async ({ api }) => {
    const { durationMs } = await measureTime(() =>
      api.sendChat(GUARDRAIL_INPUTS.promptInjection[0])
    );
    assertResponseTime(durationMs, 2000, 'Guardrail block response');
  });


  test('[TC_CHAT_063] tool call (appointment booking) responds within 10000ms', async ({ api }) => {
    const { durationMs } = await measureTime(() =>
      api.sendChat(CHAT_MESSAGES.bookAppointment)
    );
    assertResponseTime(durationMs, RESPONSE_TIMES.toolCall, 'Appointment booking tool call');
  }, { timeout: TOOL_TIMEOUT });


  // AUDIT NOTE (this round): originally used the now-undefined
  // drivingLicense, which meant this accidentally measured the FAST
  // no-docs early-return path (no LLM call at all) instead of a real RAG+
  // LLM round trip — the opposite of what the test name claims to check.
  // Repointed to emiratesId so the recorded duration is genuine.
  test('[TC_CHAT_064] RAG LLM response is recorded with actual duration', async ({ api }) => {
    // Records response time without hard failing — VPN/free tier too variable
    const { result, durationMs } = await measureTime(() =>
      api.sendChat(CHAT_MESSAGES.emiratesId)
    );
    console.log(`[TC_CHAT_064] RAG response time: ${durationMs}ms`);
    expect(result.body.reply.length).toBeGreaterThan(0);
    // Soft threshold — warn but don't fail in CI
    if (durationMs > 45000) {
      console.warn(`[TC_CHAT_064] WARNING: RAG response took ${durationMs}ms — consider upgrading Groq plan`);
    }
  }, { timeout: 60000 });


});


