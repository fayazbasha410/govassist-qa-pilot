require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const policies = require('./data/policies');
const { checkFineStatus, bookAppointment } = require('./tools/agentTools');


const { detectTopicGroup, detectEmirate, detectArabic } = require('./lib/textDetection');
const { retrieveRelevantDocs, computeConfidence } = require('./lib/ragEngine');
const { isFollowUp, enrichFollowUp } = require('./lib/followUp');
const { checkGuardrails } = require('./lib/guardrails');
const { sanitiseOutput } = require('./lib/sanitizer');
const { generateWithGuardrails } = require('./lib/outputGuardrails');
const { createSessionStore } = require('./lib/session');
const { translateArabicQuery } = require('./lib/arabicTranslation');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));


// ─────────────────────────────────────────
// SESSION / MULTI-TURN MEMORY
// v3.8.0: extracted to src/lib/session.js — this creates the one
// app-wide store instance and starts its background TTL cleanup.
// ─────────────────────────────────────────


const sessionStore = createSessionStore();
sessionStore.startCleanupInterval();


// ─────────────────────────────────────────
// LLM — GROQ API
// ─────────────────────────────────────────


const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


async function callOllama(systemPrompt, userMessage, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 1024
      });
      return completion.choices[0].message.content;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429');
      if (isRateLimit && attempt < retries) {
        const waitMs = (attempt * 6000) + Math.floor(Math.random() * 2000);
        console.log(`⏳ Groq rate limit — waiting ${(waitMs/1000).toFixed(1)}s (retry ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
}


// ─────────────────────────────────────────
// GROQ NATIVE TOOL CALLING
// ─────────────────────────────────────────


const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'bookAppointment',
      description: 'Book a government service appointment for a specific service and date. Only use this when the user explicitly asks to book or schedule an appointment — do NOT use for general information questions.',
      parameters: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            enum: ['emirates-id', 'residency-visa', 'health-card']
          },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' }
        },
        required: ['service', 'date']
      }
    }
  }
];


async function detectToolIntentWithLLM(message, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'UAE government services assistant. Use bookAppointment ONLY when the user explicitly asks to book or schedule an appointment. For all general information questions, do NOT call any tool.' },
          { role: 'user', content: message }
        ],
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        temperature: 0,
        max_tokens: 256
      });
      const responseMessage = completion.choices[0].message;
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const toolCall = responseMessage.tool_calls[0];
        return { tool: toolCall.function.name, params: JSON.parse(toolCall.function.arguments) };
      }
      return null;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429');
      if (isRateLimit && attempt < retries) {
        const waitMs = (attempt * 6000) + Math.floor(Math.random() * 2000);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      console.error('⚠️ Tool detection failed:', err.message);
      return null;
    }
  }
}


// ─────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────


const ACTIVE_SYSTEM_PROMPT = `You are GovMurshid, an AI guide for UAE government services across all seven emirates — Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah.
Answer ONLY using the policy information provided below.
Do NOT add information that is not in the context.
When an emirate is specified, focus your answer on that emirate's policies specifically.
Always mention which emirate a rule applies to if it differs across emirates.
Always name the responsible authority explicitly by its full name (e.g. "Ministry of Interior (MOI)", "ICA", "TAMM", "Department of Health — DoH") — never use vague terms like "the authority" or "the department".
Be concise, helpful, and professional.
If the answer is not in the context, say so clearly and suggest the user visit the relevant emirate portal.`;


// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────


app.get('/favicon.ico', (req, res) => res.status(204).end());


app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '3.12.0',
    model: 'groq/llama-3.1-8b-instant',
    name: 'GovMurshid',
    toolCalling: 'native',
    memory: 'multi-turn',
    policies: policies.length,
    confidenceScoring: true,
    voiceInput: true,
    outputSanitiser: true,
    outputGuardrails: true,
  });
});


app.get('/api/policies/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  const docs = retrieveRelevantDocs(q, policies);
  res.json({ query: q, results: docs });
});


// checkFineStatus is a stub — see agentTools.js. This route stays so old
// links / integrations get a helpful redirect to Tawfeer instead of a 404.
app.get('/api/tools/fines/:plateNumber', (req, res) => {
  res.json(checkFineStatus(req.params.plateNumber));
});


app.post('/api/tools/appointment', (req, res) => {
  const { service, date } = req.body;
  if (!service || !date) return res.status(400).json({ error: 'Missing service or date' });
  res.json(bookAppointment(service, date));
});


app.delete('/api/session/:sessionId', (req, res) => {
  sessionStore.deleteSession(req.params.sessionId);
  res.json({ cleared: true });
});


// ─────────────────────────────────────────
// MAIN CHAT ENDPOINT
// ─────────────────────────────────────────


app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;


  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid message' });
  }


  // ── 1. Guardrails ──────────────────────────────────────────────────
  const guard = checkGuardrails(message);
  if (guard.blocked) {
    return res.json({
      reply: guard.message,
      guardrail: { triggered: true, reason: guard.reason },
      retrievedDocs: [],
      toolUsed: null,
      confidence: null,
      language: detectArabic(message) ? 'ar' : 'en',
      memory: null,
    });
  }


  // ── 2. Language detection ──────────────────────────────────────────
  const isArabic = detectArabic(message);


  // ── 3. Session + memory ────────────────────────────────────────────
  const sid = sessionId || 'default';
  const session = sessionStore.getSession(sid);


  // v3.11.0 FIX: capture the session's PRIOR topic/emirate before this
  // turn's detection overwrites them. Previously, incomingTopic/incomingEmirate
  // were written into session.currentTopic/currentEmirate BEFORE the
  // followUp check ran, so a message's own topic keywords (e.g. "Emirates
  // ID" matching the visa group) made it look like there was already an
  // established topic — causing the very first message of a session to be
  // misread as a follow-up and its RAG query truncated to bare topic
  // keywords. Confirmed via a real promptfoo eval run where 28/28 cases
  // failed; root-caused to this exact ordering bug.
  const priorTopic   = session.currentTopic;
  const priorEmirate = session.currentEmirate;


  const incomingTopic   = detectTopicGroup(message);
  const incomingEmirate = detectEmirate(message);
  const topicChanged    = incomingTopic && priorTopic && incomingTopic !== priorTopic;


  if (incomingTopic)   session.currentTopic   = incomingTopic;
  if (incomingEmirate) session.currentEmirate = incomingEmirate;
  session.topicChanged = topicChanged;


  if (topicChanged || session.topicTurns === 0) {
    session.topicTurns = 1;
  } else {
    session.topicTurns += 1;
  }


  // ── 4. Follow-up enrichment ────────────────────────────────────────
  const followUp = isFollowUp(message) && (priorTopic || priorEmirate);
  let retrievalMessage = message;
  if (followUp) retrievalMessage = enrichFollowUp(message, session);


  // ── 5. Tool intent detection (only if booking keyword present) ────
  const BOOKING_KEYWORDS = ['book', 'appointment', 'schedule', 'reserve', 'slot'];
  const mightNeedTool    = BOOKING_KEYWORDS.some(k => message.toLowerCase().includes(k));


  const toolIntent = mightNeedTool ? await detectToolIntentWithLLM(message) : null;


  if (toolIntent) {
    // Tool Correctness check (v3.12.0) — native, deterministic equivalent of
    // DeepEval's ToolCorrectnessMetric parameter validation. Checks the
    // LLM-extracted params are well-formed BEFORE execution, independent of
    // whether the booking itself succeeds/fails on business logic (e.g. a
    // fully-booked date). This is a proportionate scope for GovMurshid's
    // single-tool, non-chained architecture — not a full agent trace tree.
    const VALID_SERVICES = ['emirates-id', 'residency-visa', 'health-card'];
    const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
    const toolCorrectness = {
      toolNameValid: toolIntent.tool === 'bookAppointment',
      serviceParamValid: VALID_SERVICES.includes(toolIntent.params?.service),
      dateParamValid: DATE_FORMAT.test(toolIntent.params?.date || ''),
    };
    toolCorrectness.allValid = toolCorrectness.toolNameValid && toolCorrectness.serviceParamValid && toolCorrectness.dateParamValid;


    const toolResult = bookAppointment(toolIntent.params.service, toolIntent.params.date);


    let toolReply = toolResult.message;
    if (isArabic) {
      toolReply = toolResult.success
        ? `تم تأكيد الموعد! رقم المرجع: ${toolResult.confirmationNumber}. التاريخ: ${toolResult.date}. الموقع: ${toolResult.location}.`
        : `عذراً، ${toolResult.message}`;
    }


    sessionStore.addToHistory(session, 'user', message);
    sessionStore.addToHistory(session, 'assistant', toolReply);


    return res.json({
      reply: toolReply,
      guardrail: { triggered: false },
      retrievedDocs: [],
      toolUsed: { name: toolIntent.tool, params: toolIntent.params, result: toolResult },
      trace: {
        spans: [
          {
            type: 'tool',
            name: toolIntent.tool,
            input: toolIntent.params,
            output: toolResult,
            correctness: toolCorrectness,
          },
        ],
      },
      language: isArabic ? 'ar' : 'en',
      memory: { turns: session.topicTurns, topic: session.currentTopic, emirate: session.currentEmirate },
      confidence: { level: 'high', label: 'Tool result', policyId: null, reason: 'Live data from government system' },
    });
  }


  // ── 6. RAG retrieval ──────────────────────────────────────────────
  const retrievalQuery = isArabic ? translateArabicQuery(retrievalMessage) : retrievalMessage;
  const topK = followUp ? 2 : 5;
  const docs = retrieveRelevantDocs(retrievalQuery, policies, topK);


  if (docs.length === 0) {
    const noResultReply = isArabic
      ? 'لم أتمكن من العثور على معلومات ذات صلة في قاعدة بيانات السياسات. يرجى زيارة البوابة الإلكترونية للإمارة المعنية للحصول على المساعدة.'
      : "I couldn't find relevant information in our policy database. Please visit the relevant UAE emirate portal for assistance.";
    return res.json({
      reply: noResultReply,
      guardrail: { triggered: false },
      retrievedDocs: [],
      toolUsed: null,
      language: isArabic ? 'ar' : 'en',
      memory: { turns: session.topicTurns, topic: session.currentTopic, emirate: session.currentEmirate, topicChanged },
      confidence: { level: 'low', label: 'Low confidence', policyId: null, reason: 'No matching policies found' },
    });
  }


  // ── 7. Confidence scoring ─────────────────────────────────────────
  const confidence = computeConfidence(docs, retrievalQuery);


  // ── 8. Build prompt ───────────────────────────────────────────────
  const context = docs.map(d => `[${d.id}] ${d.title} (${d.emirate || 'UAE'}):\n${d.content}`).join('\n\n');


  const languageInstruction = isArabic
    ? `\nالمستخدم يكتب بالعربية. يجب أن تجيب باللغة العربية الفصحى الحديثة بالكامل. احتفظ بمعرّفات السياسات مثل POL-005 باللغة الإنجليزية.`
    : `\nRespond in English.`;


  const topicFocusInstruction = followUp && session.currentTopic
    ? `\nThe user is asking a follow-up about ${session.currentTopic}${session.currentEmirate ? ` in ${session.currentEmirate}` : ''}. Answer ONLY about ${session.currentTopic} — do not introduce other topics.`
    : '';


  let historyContext = '';
  if (session.history.length > 0) {
    const recentHistory = session.history.slice(-6);
    historyContext = '\n\nCONVERSATION HISTORY:\n' +
      recentHistory.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
  }


  const systemPrompt = `${ACTIVE_SYSTEM_PROMPT}${languageInstruction}${topicFocusInstruction}${historyContext}\n\nPOLICY CONTEXT:\n${context}`;


  // ── 9. LLM call — routed through output guardrails (v3.9.0) ───────
  // generateWithGuardrails wraps callOllama with: format validation,
  // one reask on invalid output, jailbreak-compliance filtering, and a
  // groundedness check that strips any policy ID the model cites but
  // that wasn't actually in the retrieved context (hallucination guard).
  try {
    const guardResult = await generateWithGuardrails({
      callLLM: callOllama,
      systemPrompt,
      userMessage: message,
      docs,
      maxReasks: 1,
    });


    const llmReply = sanitiseOutput(guardResult.reply, isArabic);


    sessionStore.addToHistory(session, 'user', message);
    sessionStore.addToHistory(session, 'assistant', llmReply);


    res.json({
      reply: llmReply,
      guardrail: { triggered: false },
      outputGuardrail: {
        formatValid: guardResult.formatValid,
        reaskCount: guardResult.reaskCount,
        wasFiltered: guardResult.wasFiltered,
        grounded: guardResult.grounded,
        citedIds: guardResult.citedIds,
        unknownIds: guardResult.unknownIds,
      },
      trace: {
        spans: [
          {
            type: 'retriever',
            input: retrievalQuery,
            output: docs.map(d => d.id),
            topScore: docs[0]?.score ?? null,
          },
          {
            type: 'llm',
            model: 'llama-3.1-8b-instant',
            reaskCount: guardResult.reaskCount,
            grounded: guardResult.grounded,
          },
        ],
      },
      retrievedDocs: docs.map(d => ({ id: d.id, title: d.title, score: d.score, emirate: d.emirate })),
      toolUsed: null,
      language: isArabic ? 'ar' : 'en',
      memory: { turns: session.topicTurns, topic: session.currentTopic, emirate: session.currentEmirate, topicChanged },
      confidence,
    });


  } catch (err) {
    console.error('LLM error:', err.message);
    const fallbackReply = isArabic
      ? 'عذراً، المساعد غير متاح مؤقتاً. يرجى المحاولة مرة أخرى.'
      : 'Sorry, the assistant is temporarily unavailable. Please try again.';
    res.status(500).json({
      error: 'LLM unavailable',
      detail: err.message,
      reply: fallbackReply,
      guardrail: { triggered: false },
      outputGuardrail: null,
      retrievedDocs: [],
      toolUsed: null,
      language: isArabic ? 'ar' : 'en',
      memory: { turns: session.topicTurns, topic: session.currentTopic, emirate: session.currentEmirate, topicChanged: false },
      confidence: null,
    });
  }
});


// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GovMurshid v3.12.0 running at http://localhost:${PORT}`);
  console.log(`LLM: Groq API (llama-3.1-8b-instant)`);
  console.log(`Tool calling: Groq native function calling ✅`);
  console.log(`Multi-turn memory: session-based (${sessionStore.maxTurns} turns, ${sessionStore.ttlMs / 60000}min TTL) ✅`);
  console.log(`Emirate boost scoring: enabled ✅`);
  console.log(`Confidence scoring: enabled ✅`);
  console.log(`Voice input: enabled ✅`);
  console.log(`Output sanitiser: enabled ✅`);
  console.log(`Output guardrails: format validation + reask + jailbreak filter + hallucination guard ✅`);
  console.log(`Arabic support: enabled ✅`);
  console.log(`Scope: All UAE government services EXCEPT transport (see Tawfeer) ✅`);
  console.log(`Core logic modularized under src/lib/ for unit testing ✅`);
});


module.exports = app;