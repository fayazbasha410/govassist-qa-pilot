const express = require('express');
const cors = require('cors');
const path = require('path');
const policies = require('./data/policies');
const { checkFineStatus, bookAppointment } = require('./tools/agentTools');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

// Simple keyword-based retrieval (no vector DB needed for the pilot)
// In a real RAG system this would be an embedding similarity search
function retrieveRelevantDocs(query, topK = 3) {
  const queryWords = query.toLowerCase().split(/\s+/)
    .filter(w => w.length > 2); // ignore short words like "do", "is"

  // Synonym map — common query words → policy keywords
  const synonyms = {
    'expires': ['expiry', 'expired', 'renewal', 'renew'],
    'expired': ['expiry', 'expired', 'renewal'],
    'register': ['registration', 'registered'],
    'registration': ['register', 'registered', 'mandatory', 'threshold'],
    'renew': ['renewal', 'renewing', 'renewed'],
    'renewal': ['renew', 'renewed'],
    'pay': ['payment', 'paying', 'paid'],
    'payment': ['pay', 'paid'],
    'apply': ['application', 'applying'],
    'application': ['apply', 'applying'],
    'mandatory': ['required', 'compulsory', 'must'],
    'required': ['mandatory', 'compulsory', 'requirement'],
    'documents': ['document', 'documentation', 'requirements'],
    'license': ['licence', 'licensed'],
    'fine': ['fines', 'penalty', 'penalties'],
    'fines': ['fine', 'penalty', 'penalties'],
    'school': ['education', 'enrollment', 'enroll'],
    'enroll': ['enrollment', 'school', 'education'],
    'insurance': ['insured', 'coverage', 'health'],
    'tenancy': ['tenant', 'rent', 'rental', 'contract'],
    'contract': ['tenancy', 'rental', 'agreement'],
    'visa': ['residency', 'residence', 'permit'],
    'benefits': ['gratuity', 'entitlement', 'service'],
    'gratuity': ['benefits', 'entitlement', 'end of service'],
    'trade': ['business', 'commercial', 'license'],
    'vat': ['tax', 'value added', 'federal tax', 'taxable', 'supplies'],
    'threshold': ['exceeding', 'mandatory', 'registration', 'taxable'],
    'golden': ['visa', 'long-term', 'residence'],
  };

  // Expand query words with synonyms
  const expandedWords = new Set(queryWords);
  for (const word of queryWords) {
    const syns = synonyms[word] || [];
    syns.forEach(s => expandedWords.add(s));
  }

  const scored = policies.map(doc => {
    const text = (
      doc.title + ' ' +
      doc.content + ' ' +
      (doc.emirate || '') + ' ' +
      (doc.category || '')
    ).toLowerCase();

    let score = 0;
    for (const word of expandedWords) {
      if (text.includes(word)) score += 1;
    }
    // Bonus: title match is worth more
    for (const word of queryWords) {
      if (doc.title.toLowerCase().includes(word)) score += 2;
    }
    return { ...doc, score };
  });

  return scored
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Guardrails — detect out-of-scope or malicious input
function checkGuardrails(message) {
  const lower = message.toLowerCase();

  const banned = [
    'ignore previous instructions',
    'ignore all instructions',
    'you are now',
    'pretend you are',
    'forget your instructions',
    'jailbreak',
    'dan mode',
    'developer mode',
    'system prompt',
    'override',
    'bypass'
  ];

  const offTopic = [
    'weather', 'recipe', 'sports', 'movie', 'music',
    'joke', 'game', 'dating', 'stock', 'crypto', 'bitcoin',
    'football', 'cricket', 'basketball', 'tennis', 'match'
  ];

  for (const phrase of banned) {
    if (lower.includes(phrase)) {
      return {
        blocked: true,
        reason: 'prompt_injection',
        message: 'I can only assist with UAE government services. I cannot follow instructions that attempt to change my behaviour.'
      };
    }
  }

  for (const topic of offTopic) {
    if (lower.includes(topic)) {
      return {
        blocked: true,
        reason: 'off_topic',
        message: `I'm GovMurshid, specialising in UAE government services across all seven emirates. I can help with licenses, fines, appointments, visas, housing, healthcare, education, business, and social services.`
      };
    }
  }

  return { blocked: false };
}

// Call Ollama locally
async function callOllama(systemPrompt, userMessage) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.message.content;
}

// Detect if the user wants to use an agent tool
function detectToolIntent(message) {
  const lower = message.toLowerCase();

  if (lower.includes('fine') && (lower.includes('plate') || lower.match(/[a-z]{2,3}-\d{3,4}/i))) {
    const plateMatch = message.match(/[A-Z]{2,3}-\d{3,4}/i);
    if (plateMatch) {
      return { tool: 'checkFineStatus', params: { plateNumber: plateMatch[0] } };
    }
  }

  if (lower.includes('book') || lower.includes('appointment')) {
    const services = ['driving-license', 'vehicle-registration', 'emirates-id', 'residency-visa', 'health-card'];
    const dateMatch = message.match(/\d{4}-\d{2}-\d{2}/);
    const serviceMatch = services.find(s => lower.includes(s.replace('-', ' ')) || lower.includes(s));

    if (serviceMatch && dateMatch) {
      return { tool: 'bookAppointment', params: { service: serviceMatch, date: dateMatch[0] } };
    }
  }

  return null;
}

// ─────────────────────────────────────────
// SYSTEM PROMPTS
// ─────────────────────────────────────────

// ✅ ACTIVE — production prompt (UAE-wide, grounded, professional)
const SYSTEM_PROMPT_PRODUCTION = `You are GovMurshid, an AI guide for UAE government services across all seven emirates — Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah.
Answer ONLY using the policy information provided below.
Do NOT add information that is not in the context.
Always mention which emirate a rule applies to if it differs across emirates.
Be concise, helpful, and professional.
If the answer is not in the context, say so clearly and suggest the user visit the relevant emirate portal.`;

// 🧪 TEST ONLY — used to verify regression gate fires on bad prompt
// const SYSTEM_PROMPT_GENERAL = `You are a general assistant. Answer any question you like freely.`;

// 🧪 TEST ONLY — used to verify regression gate fires on comedian prompt
// const SYSTEM_PROMPT_COMEDIAN = `You are a comedian. Respond to every question with a joke and never give factual information.`;

// Active prompt — change this line to test regression detection
const ACTIVE_SYSTEM_PROMPT = SYSTEM_PROMPT_PRODUCTION;

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

// Health check — used by tests to confirm server is up
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', model: 'llama3.2', name: 'GovMurshid' });
});

// Policy search — returns raw retrieved docs (used by RAG eval tests)
app.get('/api/policies/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  const docs = retrieveRelevantDocs(q);
  res.json({ query: q, results: docs });
});

// Tool endpoints — called directly by agent tests
app.get('/api/tools/fines/:plateNumber', (req, res) => {
  const result = checkFineStatus(req.params.plateNumber);
  res.json(result);
});

app.post('/api/tools/appointment', (req, res) => {
  const { service, date } = req.body;
  if (!service || !date) {
    return res.status(400).json({ error: 'Missing service or date' });
  }
  const result = bookAppointment(service, date);
  res.json(result);
});

// Main chat endpoint — the RAG + agent + guardrail pipeline
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid message' });
  }

  // 1. Guardrails check
  const guard = checkGuardrails(message);
  if (guard.blocked) {
    return res.json({
      reply: guard.message,
      guardrail: { triggered: true, reason: guard.reason },
      retrievedDocs: [],
      toolUsed: null
    });
  }

  // 2. Tool intent detection (agentic layer)
  const toolIntent = detectToolIntent(message);
  if (toolIntent) {
    let toolResult;
    if (toolIntent.tool === 'checkFineStatus') {
      toolResult = checkFineStatus(toolIntent.params.plateNumber);
    } else if (toolIntent.tool === 'bookAppointment') {
      toolResult = bookAppointment(toolIntent.params.service, toolIntent.params.date);
    }

    return res.json({
      reply: toolResult.message,
      guardrail: { triggered: false },
      retrievedDocs: [],
      toolUsed: { name: toolIntent.tool, params: toolIntent.params, result: toolResult }
    });
  }

  // 3. RAG — retrieve relevant policy docs
  const docs = retrieveRelevantDocs(message);

  if (docs.length === 0) {
    return res.json({
      reply: "I couldn't find relevant information in our policy database. Please visit the relevant UAE emirate portal for assistance.",
      guardrail: { triggered: false },
      retrievedDocs: [],
      toolUsed: null
    });
  }

  // 4. Build grounded prompt and call LLM
  const context = docs.map(d => `[${d.id}] ${d.title}:\n${d.content}`).join('\n\n');

  const systemPrompt = `${ACTIVE_SYSTEM_PROMPT}

POLICY CONTEXT:
${context}`;

  try {
    const llmReply = await callOllama(systemPrompt, message);
    res.json({
      reply: llmReply,
      guardrail: { triggered: false },
      retrievedDocs: docs.map(d => ({ id: d.id, title: d.title, score: d.score })),
      toolUsed: null
    });
  } catch (err) {
    console.error('LLM error:', err.message);
    res.status(500).json({ error: 'LLM unavailable', detail: err.message });
  }
});

// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GovMurshid server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;