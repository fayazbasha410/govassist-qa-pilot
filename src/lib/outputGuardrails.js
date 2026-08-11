// ─────────────────────────────────────────
// OUTPUT GUARDRAILS — Phase 1 (v3.9.0)
//
// Complements the existing INPUT guardrails (src/lib/guardrails.js).
// Four pieces:
//   1. validateOutputFormat — is the shape of the LLM output sane?
//   2. filterOutput         — strip any jailbreak-compliant leakage
//   3. checkGroundedness    — does the reply only cite policies that were
//                             actually retrieved? (hallucination guard)
//   4. generateWithGuardrails — orchestrator: calls the LLM, validates,
//                             reasks once on bad output, then checks
//                             groundedness. Takes the LLM caller as an
//                             injected dependency so it's fully unit
//                             testable with a mock — no network calls.
// ─────────────────────────────────────────


const DEFAULT_MIN_LENGTH = 5;
const DEFAULT_MAX_LENGTH = 4000;


// Signals that the raw text isn't a real answer at all — an empty/near-empty
// reply, or a leaked fragment of the system prompt itself (which would mean
// the model echoed its instructions instead of answering).
const LEAK_MARKERS = [
  'POLICY CONTEXT:',
  'You are GovMurshid, an AI guide',
  'CONVERSATION HISTORY:',
];


// Signals that the model complied with a jailbreak attempt and is now
// narrating that compliance in its own output — even if the input guardrail
// missed the attempt, this catches it on the way out.
const JAILBREAK_COMPLIANCE_PATTERNS = [
  /as an ai (with no restrictions|without restrictions)/i,
  /i (will|can|shall) ignore (my|the) (instructions|guidelines|restrictions)/i,
  /developer mode (enabled|activated|is now on)/i,
  /i am (now )?dan\b/i,
  /jailbreak (successful|mode enabled)/i,
];


function validateOutputFormat(text, options = {}) {
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;


  if (!text || typeof text !== 'string') {
    return { valid: false, reason: 'empty_or_missing' };
  }


  const trimmed = text.trim();


  if (trimmed.length < minLength) {
    return { valid: false, reason: 'too_short' };
  }


  if (trimmed.length > maxLength) {
    return { valid: false, reason: 'too_long' };
  }


  for (const marker of LEAK_MARKERS) {
    if (trimmed.includes(marker)) {
      return { valid: false, reason: 'system_prompt_leak' };
    }
  }


  return { valid: true, reason: null };
}


function filterOutput(text) {
  if (!text) return { filtered: text, wasFiltered: false, matchedPatterns: [] };


  const matchedPatterns = [];
  for (const pattern of JAILBREAK_COMPLIANCE_PATTERNS) {
    if (pattern.test(text)) {
      matchedPatterns.push(pattern.source);
    }
  }


  if (matchedPatterns.length === 0) {
    return { filtered: text, wasFiltered: false, matchedPatterns: [] };
  }


  // Any jailbreak-compliance leakage found — don't try to surgically edit
  // the model's own output (too easy to leave adjacent unsafe content
  // intact); replace the whole reply with a safe fallback instead.
  return {
    filtered: "I can only assist with UAE government services. Please rephrase your question.",
    wasFiltered: true,
    matchedPatterns,
  };
}


function checkGroundedness(replyText, retrievedDocs) {
  const retrievedIds = new Set((retrievedDocs || []).map(d => d.id));
  const citedIds = [...new Set((replyText || '').match(/POL-\d{3}/g) || [])];
  const unknownIds = citedIds.filter(id => !retrievedIds.has(id));


  return {
    grounded: unknownIds.length === 0,
    citedIds,
    unknownIds,
    hasCitation: citedIds.length > 0,
  };
}


// Strips fabricated policy ID citations (ones that failed groundedness)
// from the reply text, so the user never sees a citation to a policy
// that wasn't actually part of the retrieved context.
function stripUnknownCitations(replyText, unknownIds) {
  if (!unknownIds || unknownIds.length === 0) return replyText;
  let result = replyText;
  for (const id of unknownIds) {
    result = result.split(`[${id}]`).join('').split(id).join('');
  }
  return result.replace(/\s{3,}/g, ' ').trim();
}


// Orchestrator. `callLLM` is an injected async function with signature
// (systemPrompt, userMessage) => Promise<string> — in production this is
// server.js's callOllama; in tests it's a mock with no network calls.
async function generateWithGuardrails({ callLLM, systemPrompt, userMessage, docs = [], maxReasks = 1 }) {
  let reasksUsed = 0;
  let currentPrompt = systemPrompt;
  let rawReply = await callLLM(currentPrompt, userMessage);
  let formatCheck = validateOutputFormat(rawReply);


  while (!formatCheck.valid && reasksUsed < maxReasks) {
    reasksUsed++;
    currentPrompt = `${systemPrompt}\n\nIMPORTANT: Your previous response was invalid (${formatCheck.reason}). Provide a clear, direct answer to the user's question using only the policy context above.`;
    rawReply = await callLLM(currentPrompt, userMessage);
    formatCheck = validateOutputFormat(rawReply);
  }


  const filterResult = filterOutput(rawReply || '');
  const textAfterFilter = filterResult.filtered;


  const groundedness = checkGroundedness(textAfterFilter, docs);
  const finalReply = groundedness.grounded
    ? textAfterFilter
    : stripUnknownCitations(textAfterFilter, groundedness.unknownIds);


  return {
    reply: finalReply,
    formatValid: formatCheck.valid,
    formatReason: formatCheck.reason,
    reaskCount: reasksUsed,
    wasFiltered: filterResult.wasFiltered,
    grounded: groundedness.grounded,
    citedIds: groundedness.citedIds,
    unknownIds: groundedness.unknownIds,
  };
}


module.exports = {
  DEFAULT_MIN_LENGTH,
  DEFAULT_MAX_LENGTH,
  LEAK_MARKERS,
  JAILBREAK_COMPLIANCE_PATTERNS,
  validateOutputFormat,
  filterOutput,
  checkGroundedness,
  stripUnknownCitations,
  generateWithGuardrails,
};