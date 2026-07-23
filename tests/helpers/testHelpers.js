// ─────────────────────────────────────────────────────────────────────────────
// GovMurshid — Test Helpers
// Shared utilities across all spec files
// ─────────────────────────────────────────────────────────────────────────────

const ARABIC_PATTERN = /[\u0600-\u06FF]/;

// ── UI Helpers ────────────────────────────────────────────────────────────────

async function waitForAssistantReply(page, nth = 1, timeout = 30000) {
  const reply = page.locator('.message.assistant').nth(nth);
  await reply.waitFor({ state: 'visible', timeout });
  return reply;
}

async function sendMessageAndWait(page, message, timeout = 30000) {
  await page.locator('#user-input').fill(message);
  await page.locator('#send-btn').click();
  return waitForAssistantReply(page, 1, timeout);
}

async function expectTag(page, tagType, timeout = 30000) {
  const tag = page.locator(`.tag.${tagType}`);
  await tag.waitFor({ state: 'visible', timeout });
  return tag;
}

// ── Response Time Helpers ─────────────────────────────────────────────────────

/**
 * Measure how long an async API call takes in milliseconds
 * Usage: const { result, durationMs } = await measureTime(() => api.sendChat('...'))
 */
async function measureTime(asyncFn) {
  const start = Date.now();
  const result = await asyncFn();
  const durationMs = Date.now() - start;
  return { result, durationMs };
}

/**
 * Assert response time is within threshold
 */
function assertResponseTime(durationMs, thresholdMs, label = 'Response') {
  if (durationMs > thresholdMs) {
    throw new Error(
      `${label} took ${durationMs}ms — exceeds threshold of ${thresholdMs}ms`
    );
  }
}

// ── Language Helpers ──────────────────────────────────────────────────────────

function containsArabic(text) {
  return ARABIC_PATTERN.test(text);
}

function assertArabicResponse(body) {
  if (!containsArabic(body.reply)) {
    throw new Error(`Expected Arabic characters in reply but got: ${body.reply.slice(0, 100)}`);
  }
  if (body.language !== 'ar') {
    throw new Error(`Expected language 'ar' but got '${body.language}'`);
  }
}

function assertEnglishResponse(body) {
  if (body.language !== 'en') {
    throw new Error(`Expected language 'en' but got '${body.language}'`);
  }
}

// ── Schema Validators ─────────────────────────────────────────────────────────

function assertChatResponseSchema(body) {
  if (typeof body.reply !== 'string' || body.reply.length === 0)
    throw new Error('reply must be a non-empty string');
  if (typeof body.guardrail !== 'object')
    throw new Error('guardrail must be an object');
  if (typeof body.guardrail.triggered !== 'boolean')
    throw new Error('guardrail.triggered must be a boolean');
  if (!Array.isArray(body.retrievedDocs))
    throw new Error('retrievedDocs must be an array');
  if (body.language !== undefined && !['en', 'ar'].includes(body.language))
    throw new Error(`language must be 'en' or 'ar', got '${body.language}'`);
}

function assertFineSchema(fine) {
  if (typeof fine.id !== 'string')      throw new Error('fine.id must be string');
  if (typeof fine.amount !== 'number')  throw new Error('fine.amount must be number');
  if (typeof fine.reason !== 'string')  throw new Error('fine.reason must be string');
  if (typeof fine.date !== 'string')    throw new Error('fine.date must be string');
  if (typeof fine.paid !== 'boolean')   throw new Error('fine.paid must be boolean');
  if (fine.amount <= 0)                 throw new Error('fine.amount must be positive');
  if (new Date(fine.date).toString() === 'Invalid Date')
    throw new Error(`fine.date is not a valid date: ${fine.date}`);
}

function assertAppointmentSchema(body) {
  if (typeof body.success !== 'boolean')
    throw new Error('success must be boolean');
  if (body.success) {
    if (!body.confirmationNumber || !body.confirmationNumber.startsWith('TAMM-'))
      throw new Error('confirmationNumber must start with TAMM-');
    if (typeof body.service !== 'string')
      throw new Error('service must be string');
    if (typeof body.date !== 'string')
      throw new Error('date must be string');
    if (typeof body.location !== 'string')
      throw new Error('location must be string');
    if (typeof body.time !== 'string')
      throw new Error('time must be string');
  } else {
    if (typeof body.message !== 'string')
      throw new Error('failed appointment must have message string');
  }
}

function assertFinesResponseSchema(body) {
  if (typeof body.success !== 'boolean')
    throw new Error('success must be boolean');
  if (typeof body.plateNumber !== 'string')
    throw new Error('plateNumber must be string');
  if (!Array.isArray(body.fines))
    throw new Error('fines must be an array');
  if (typeof body.unpaidTotal !== 'number')
    throw new Error('unpaidTotal must be number');
  if (typeof body.message !== 'string')
    throw new Error('message must be string');
}

function assertPolicySearchSchema(body) {
  if (typeof body.query !== 'string')
    throw new Error('query must be string');
  if (!Array.isArray(body.results))
    throw new Error('results must be array');
  for (const doc of body.results) {
    if (typeof doc.id !== 'string')      throw new Error('doc.id must be string');
    if (typeof doc.title !== 'string')   throw new Error('doc.title must be string');
    if (typeof doc.content !== 'string') throw new Error('doc.content must be string');
    if (typeof doc.score !== 'number')   throw new Error('doc.score must be number');
    if (doc.score <= 0)                  throw new Error('doc.score must be positive');
  }
}

function assertMemorySchema(body) {
  if (typeof body.sessionId !== 'string')
    throw new Error('sessionId must be string');
  if (typeof body.topicChanged !== 'boolean')
    throw new Error('topicChanged must be boolean');
}

// ── Policy Helpers ────────────────────────────────────────────────────────────

function assertPolicyInResults(results, expectedId) {
  const ids = results.map(r => r.id);
  if (!ids.includes(expectedId)) {
    throw new Error(
      `Expected policy ${expectedId} in results but got: [${ids.join(', ')}]`
    );
  }
}

module.exports = {
  waitForAssistantReply,
  sendMessageAndWait,
  expectTag,
  measureTime,
  assertResponseTime,
  containsArabic,
  assertArabicResponse,
  assertEnglishResponse,
  assertChatResponseSchema,
  assertFineSchema,
  assertFinesResponseSchema,
  assertAppointmentSchema,
  assertPolicySearchSchema,
  assertMemorySchema,
  assertPolicyInResults,
};