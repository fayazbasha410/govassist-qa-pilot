require('dotenv').config();
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
// MULTI-TURN MEMORY
// ─────────────────────────────────────────

const SESSION_MAX_TURNS = 6;
const SESSION_TTL_MS = 30 * 60 * 1000;
const sessions = new Map();

const TOPIC_GROUPS = {
  driving: ['driving', 'license', 'licence', 'renew driving', 'vehicle registration', 'mulkiya', 'traffic fine', 'plate'],
  school: ['school', 'enroll', 'enrollment', 'education', 'khda', 'adek', 'spea', 'child', 'kindergarten', 'university'],
  insurance: ['insurance', 'health card', 'dha', 'haad', 'doh', 'whi'],
  visa: ['visa', 'residency', 'residence', 'golden visa', 'icp', 'gdrfa', 'passport', 'emirates id', 'birth certificate'],
  housing: ['tenancy', 'ejari', 'tawtheeq', 'rent', 'lease', 'landlord', 'tasdeeq', 'dewa', 'addc', 'sewa', 'property'],
  business: ['trade license', 'business license', 'ded', 'sedd', 'rakez', 'ffza', 'vat', 'tax', 'freelance'],
  social: ['social support', 'gratuity', 'end of service', 'zakat', 'pension', 'people of determination'],
};

function detectTopicGroup(text) {
  const lower = text.toLowerCase();
  for (const [group, keywords] of Object.entries(TOPIC_GROUPS)) {
    if (keywords.some(k => lower.includes(k))) return group;
  }
  return null;
}

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],
      currentTopic: null,
      topicChanged: false,
      lastActive: Date.now()
    });
  }
  const session = sessions.get(sessionId);
  session.lastActive = Date.now();
  return session;
}

function addToHistory(sessionId, role, content) {
  const session = getSession(sessionId);
  session.history.push({ role, content });
  if (session.history.length > SESSION_MAX_TURNS) {
    session.history = session.history.slice(-SESSION_MAX_TURNS);
  }
}

function clearSession(sessionId) {
  sessions.delete(sessionId);
}

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActive > SESSION_TTL_MS) {
      sessions.delete(id);
      console.log(`🗑 Session ${id} expired and cleared`);
    }
  }
}, 10 * 60 * 1000);


// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const EMIRATES = [
  'abu dhabi', 'dubai', 'sharjah', 'ajman',
  'umm al quwain', 'ras al khaimah', 'fujairah'
];

const PLATE_PATTERN = /\b[A-Z]{1,3}[-\s]?\d{3,5}\b/i;

function isShortFollowUp(message) {
  const wordCount = message.trim().split(/\s+/).length;
  const hasTopic = detectTopicGroup(message) !== null;
  return wordCount <= 8 && !hasTopic;
}

function retrieveRelevantDocs(query, topK = 5) {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

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
    'enrollment': ['enroll', 'school', 'education'],
    'insurance': ['insured', 'coverage', 'health'],
    'health': ['healthcare', 'insurance', 'medical'],
    'healthcare': ['health', 'insurance', 'medical'],
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

  const expandedWords = new Set(queryWords);
  for (const word of queryWords) {
    const syns = synonyms[word] || [];
    syns.forEach(s => expandedWords.add(s));
  }

  // Pick the LAST emirate mentioned so "Sharjah what about Dubai" → Dubai
  let mentionedEmirate = null;
  for (const e of EMIRATES) {
    if (queryLower.includes(e)) mentionedEmirate = e;
  }

  const scored = policies.map(doc => {
    const text = (
      doc.title + ' ' + doc.content + ' ' +
      (doc.emirate || '') + ' ' + (doc.category || '')
    ).toLowerCase();

    let score = 0;
    for (const word of expandedWords) {
      if (text.includes(word)) score += 1;
    }
    for (const word of queryWords) {
      if (doc.title.toLowerCase().includes(word)) score += 2;
    }
    if (mentionedEmirate) {
      const docEmirate = (doc.emirate || '').toLowerCase();
      if (docEmirate === mentionedEmirate) score += 5;
      else if (docEmirate === 'all uae') score += 1;
    }
    return { ...doc, score };
  });

  return scored
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}


// ─────────────────────────────────────────
// ARABIC DETECTION + TRANSLATION
// ─────────────────────────────────────────

function detectArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function translateArabicQuery(text) {
  const translations = {
    'رخصة القيادة': 'driving license', 'تجديد رخصة القيادة': 'driving license renewal',
    'رخصة': 'license', 'القيادة': 'driving', 'تجديد': 'renewal renew',
    'غرامة': 'fine', 'غرامات': 'fines', 'مخالفة': 'fine penalty', 'مرور': 'traffic',
    'سيارة': 'vehicle', 'تسجيل السيارة': 'vehicle registration', 'تسجيل': 'registration',
    'الهوية الإماراتية': 'Emirates ID', 'بطاقة الهوية': 'Emirates ID', 'هوية': 'Emirates ID',
    'تأشيرة الإقامة': 'residency visa', 'تأشيرة': 'visa',
    'إقامة ذهبية': 'golden visa', 'الإقامة الذهبية': 'golden visa', 'فيزا ذهبية': 'golden visa',
    'التقدم للحصول على الإقامة الذهبية': 'golden visa eligibility investors entrepreneurs',
    'إقامة': 'residency', 'جواز سفر': 'passport', 'شهادة ميلاد': 'birth certificate',
    'التأمين الصحي إلزامي': 'health insurance mandatory DHA employer',
    'التأمين الصحي': 'health insurance DHA', 'تأمين صحي': 'health insurance',
    'تأمين': 'insurance', 'صحي': 'health', 'إلزامي': 'mandatory required',
    'لياقة طبية': 'medical fitness', 'فحص طبي': 'medical fitness',
    'شهادة لياقة': 'medical fitness certificate',
    'مدرسة': 'school', 'تعليم': 'education',
    'تسجيل مدرسي': 'school enrollment', 'التسجيل في المدرسة': 'school enrollment KHDA',
    'عقد الإيجار': 'tenancy contract', 'عقد إيجار': 'tenancy contract',
    'إيجار': 'tenancy rental', 'إيجاري': 'Ejari', 'توثيق': 'Tawtheeq',
    'تسجيل عقد الإيجار': 'tenancy contract registration Ejari',
    'ترخيص تجاري': 'trade license', 'رخصة تجارية': 'trade license',
    'ضريبة القيمة المضافة': 'VAT Federal Tax Authority', 'ضريبة': 'VAT tax',
    'عمل حر': 'freelance permit', 'فريلانس': 'freelance',
    'دعم اجتماعي': 'social support', 'زكاة': 'Zakat', 'معاش': 'pension gratuity',
    'مكافأة نهاية الخدمة': 'end of service gratuity', 'نهاية الخدمة': 'end of service gratuity',
    'ذوي الهمم': 'people of determination disability',
    'كهرباء': 'electricity DEWA ADDC', 'ماء': 'water utility',
    'حجز موعد': 'book appointment', 'موعد': 'appointment',
    'الإمارات': 'UAE emirates', 'أبوظبي': 'Abu Dhabi', 'دبي': 'Dubai',
    'الشارقة': 'Sharjah', 'عجمان': 'Ajman', 'رأس الخيمة': 'Ras Al Khaimah',
    'الفجيرة': 'Fujairah', 'أم القيوين': 'Umm Al Quwain',
    'كيف': '', 'ما هي': '', 'ما هو': '', 'هل': '', 'من': '', 'متى': '',
    'أين': '', 'في': '', 'على': '', 'من يحق له': '', 'يحق له': '',
    'للحصول على': '', 'التقدم': '', 'أسجل': 'registration', 'أجدد': 'renewal',
    'أحصل': '', 'يمكنني': '', 'أريد': '',
  };

  let translated = text;
  const sortedEntries = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
  for (const [arabic, english] of sortedEntries) {
    translated = translated.replace(new RegExp(arabic, 'g'), english);
  }
  return translated
    .replace(/[\u0600-\u06FF]+/g, '').replace(/[؟،]/g, '')
    .replace(/\s+/g, ' ').trim();
}


// ─────────────────────────────────────────
// GUARDRAILS (English + Arabic)
// ─────────────────────────────────────────

function checkGuardrails(message) {
  const lower = message.toLowerCase();

  const banned = [
    'ignore previous instructions', 'ignore all instructions', 'you are now',
    'pretend you are', 'forget your instructions', 'jailbreak', 'dan mode',
    'developer mode', 'system prompt', 'override', 'bypass'
  ];
  const arabicBanned = [
    'تجاهل التعليمات', 'تجاهل جميع التعليمات', 'أنت الآن', 'تظاهر بأنك',
    'انسَ تعليماتك', 'تجاوز', 'بدون قيود', 'بلا قيود', 'وضع المطور',
    'الموجه النظامي', 'تجاوز إعداداتك', 'تجاوز القيود', 'تصرف كمساعد مختلف'
  ];
  const offTopic = [
    'weather', 'recipe', 'sports', 'movie', 'music', 'joke', 'game',
    'dating', 'stock', 'crypto', 'bitcoin', 'football', 'cricket',
    'basketball', 'tennis', 'match'
  ];
  const arabicOffTopic = [
    'الطقس', 'وصفة', 'رياضة', 'كرة القدم', 'كرة السلة', 'مباراة',
    'فيلم', 'موسيقى', 'نكتة', 'العملات المشفرة', 'بيتكوين',
    'مواعدة', 'الأسهم', 'البورصة'
  ];

  for (const p of banned) {
    if (lower.includes(p)) return {
      blocked: true, reason: 'prompt_injection',
      message: 'I can only assist with UAE government services. I cannot follow instructions that attempt to change my behaviour.'
    };
  }
  for (const p of arabicBanned) {
    if (message.includes(p)) return {
      blocked: true, reason: 'prompt_injection',
      message: 'يمكنني فقط المساعدة في خدمات حكومة الإمارات. لا يمكنني اتباع تعليمات تحاول تغيير سلوكي.'
    };
  }
  for (const t of offTopic) {
    if (lower.includes(t)) return {
      blocked: true, reason: 'off_topic',
      message: `I'm GovMurshid, specialising in UAE government services across all seven emirates. I can help with licenses, fines, appointments, visas, housing, healthcare, education, business, and social services.`
    };
  }
  for (const t of arabicOffTopic) {
    if (message.includes(t)) return {
      blocked: true, reason: 'off_topic',
      message: `أنا GovMurshid، متخصص في خدمات حكومة الإمارات عبر جميع الإمارات السبع. يمكنني المساعدة في الرخص والغرامات والمواعيد والتأشيرات والإسكان والرعاية الصحية والتعليم والأعمال والخدمات الاجتماعية.`
    };
  }
  return { blocked: false };
}


// ─────────────────────────────────────────
// LLM — GROQ API
// ─────────────────────────────────────────

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callOllama(systemPrompt, userMessage, history = [], retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 1024
      });
      return completion.choices[0].message.content;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429');
      if (isRateLimit && attempt < retries) {
        const waitMs = attempt * 6000;
        console.log(`⏳ Groq rate limit — waiting ${waitMs / 1000}s`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
}


// ─────────────────────────────────────────
// TOOL DETECTION
// ─────────────────────────────────────────

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'checkFineStatus',
      description: 'Check traffic fines for a vehicle plate number.',
      parameters: {
        type: 'object',
        properties: {
          plateNumber: { type: 'string', description: 'e.g. AD-1234 or DXB-5678' }
        },
        required: ['plateNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'bookAppointment',
      description: 'Book a government appointment when user gives both a service and a date.',
      parameters: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            enum: ['driving-license', 'vehicle-registration', 'emirates-id', 'residency-visa', 'health-card']
          },
          date: { type: 'string', description: 'YYYY-MM-DD' }
        },
        required: ['service', 'date']
      }
    }
  }
];

// Fast regex pre-check — avoids a Groq API call for most messages.
// Returns: 'fine_check' | 'appointment' | null
function fastToolPreCheck(message) {
  const hasPlate = PLATE_PATTERN.test(message);
  const hasFineWord = /\bfine|fines|penalty|penalties|unpaid|مخالف|غرامة\b/i.test(message);
  if (hasPlate && hasFineWord) return 'fine_check';

  const hasBookWord = /\bbook|schedule|appointment\b/i.test(message.toLowerCase());
  const hasDate = /\d{4}-\d{2}-\d{2}/.test(message);
  if (hasBookWord && hasDate) return 'appointment';

  return null;
}

async function detectToolIntentWithLLM(message, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a strict tool router with exactly two tools.
Use checkFineStatus ONLY when message contains a vehicle plate (like AD-1234) AND asks about fines.
Use bookAppointment ONLY when message asks to book AND has both a service name AND a date (YYYY-MM-DD).
For ALL other messages return NO tool call.`
          },
          { role: 'user', content: message }
        ],
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        temperature: 0,
        max_tokens: 128
      });

      const responseMessage = completion.choices[0].message;
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const toolCall = responseMessage.tool_calls[0];
        const toolParams = JSON.parse(toolCall.function.arguments);
        console.log(`🔧 Tool: ${toolCall.function.name}`, toolParams);
        return { tool: toolCall.function.name, params: toolParams };
      }
      return null;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429');
      if (isRateLimit && attempt < retries) {
        await new Promise(r => setTimeout(r, attempt * 6000));
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

Answer ONLY using the policy information provided in POLICY CONTEXT below.
Do NOT add any information not in the context.

CRITICAL RULE: If the user asks about a specific emirate, use ONLY the policy for that emirate from the context. If a specific emirate policy exists in the context, use it — do not use a different emirate's policy or the All UAE policy as the primary answer.

Be concise, helpful, and professional.
If the answer is not in the context, say so and suggest the user visit the relevant emirate portal.`;


// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok', version: '3.3.0', model: 'groq/llama-3.1-8b-instant',
    name: 'GovMurshid', toolCalling: 'native', memory: 'multi-turn',
    policies: policies.length
  });
});

app.get('/api/policies/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  res.json({ query: q, results: retrieveRelevantDocs(q) });
});

app.get('/api/tools/fines/:plateNumber', (req, res) => {
  res.json(checkFineStatus(req.params.plateNumber));
});

app.post('/api/tools/appointment', (req, res) => {
  const { service, date } = req.body;
  if (!service || !date) return res.status(400).json({ error: 'Missing service or date' });
  res.json(bookAppointment(service, date));
});

app.post('/api/session/clear', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) clearSession(sessionId);
  res.json({ cleared: true });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid message' });
  }

  const sid = sessionId || 'default';
  const session = getSession(sid);

  // 1. Guardrails
  const guard = checkGuardrails(message);
  if (guard.blocked) {
    return res.json({
      reply: guard.message,
      guardrail: { triggered: true, reason: guard.reason },
      retrievedDocs: [], toolUsed: null,
      topicChanged: false
    });
  }

  // 2. Language detection
  const isArabic = detectArabic(message);

  // 3. Topic change detection — stored separately from history so it
  //    survives history trimming after SESSION_MAX_TURNS
  const incomingTopic = detectTopicGroup(message);
  if (incomingTopic !== null && session.currentTopic !== null && incomingTopic !== session.currentTopic) {
    console.log(`🔄 Topic change: ${session.currentTopic} → ${incomingTopic} — clearing history`);
    session.history = [];
    session.currentTopic = incomingTopic;
    session.topicChanged = true;
  } else if (incomingTopic !== null) {
    session.currentTopic = incomingTopic;
    session.topicChanged = false;
  } else {
    session.topicChanged = false;
  }

  console.log(`💬 Session ${sid} | topic: ${session.currentTopic} | history: ${session.history.length}`);

  // 4. Tool detection — fast pre-check first, Groq only for appointments
  let toolIntent = null;
  const preCheck = fastToolPreCheck(message);

  if (preCheck === 'fine_check') {
    const plateMatch = message.match(PLATE_PATTERN);
    if (plateMatch) {
      toolIntent = { tool: 'checkFineStatus', params: { plateNumber: plateMatch[0].toUpperCase() } };
      console.log(`⚡ Fast check: checkFineStatus ${plateMatch[0]}`);
    }
  } else if (preCheck === 'appointment') {
    toolIntent = await detectToolIntentWithLLM(message);
  }
  // preCheck === null → skip tool detection → straight to RAG

  if (toolIntent) {
    let toolResult;
    if (toolIntent.tool === 'checkFineStatus') {
      toolResult = checkFineStatus(toolIntent.params.plateNumber);
    } else if (toolIntent.tool === 'bookAppointment') {
      toolResult = bookAppointment(toolIntent.params.service, toolIntent.params.date);
    }

    let toolReply = toolResult.message;
    if (isArabic && toolIntent.tool === 'checkFineStatus') {
      toolReply = toolResult.unpaidTotal > 0
        ? `لديك مبلغ ${toolResult.unpaidTotal} درهم كغرامات غير مدفوعة للوحة ${toolResult.plateNumber}.`
        : `جميع الغرامات مدفوعة للوحة ${toolResult.plateNumber}.`;
    }
    if (isArabic && toolIntent.tool === 'bookAppointment') {
      toolReply = toolResult.success
        ? `تم تأكيد الموعد! رقم المرجع: ${toolResult.confirmationNumber}. التاريخ: ${toolResult.date}. الموقع: ${toolResult.location}.`
        : `عذراً، ${toolResult.message}`;
    }

    addToHistory(sid, 'user', message);
    addToHistory(sid, 'assistant', toolReply);

    return res.json({
      reply: toolReply,
      guardrail: { triggered: false },
      retrievedDocs: [],
      toolUsed: { name: toolIntent.tool, params: toolIntent.params, result: toolResult },
      language: isArabic ? 'ar' : 'en',
      sessionId: sid,
      sessionTurns: session.history.length,
      topicChanged: session.topicChanged
    });
  }

  /*
  // 5. RAG query building
  let retrievalQuery = isArabic ? translateArabicQuery(message) : message;

  if (isShortFollowUp(message) && session.history.length >= 2) {
    // Find first user message in history with a topic keyword
    const topicMsg = session.history.filter(h => h.role === 'user')
      .find(m => detectTopicGroup(m.content) !== null);
    if (topicMsg) {
      retrievalQuery = `${topicMsg.content} ${message}`;
      console.log(`📎 Enriched: "${retrievalQuery.slice(0, 80)}..."`);
    } else if (session.currentTopic) {
      // All history is follow-ups — use stored topic group keywords
      const topicKeywords = TOPIC_GROUPS[session.currentTopic].join(' ');
      retrievalQuery = `${topicKeywords} ${message}`;
      console.log(`📎 Topic-enriched (${session.currentTopic}): "${retrievalQuery.slice(0, 80)}..."`);
    }
  }
    */

  // 5. RAG query building
  let retrievalQuery = isArabic ? translateArabicQuery(message) : message;

  // If current topic is driving and user asks "what about [emirate]?"
  // without a plate number — prompt for plate instead of going to RAG
  if (isShortFollowUp(message) && session.currentTopic === 'driving' &&
    EMIRATES.some(e => message.toLowerCase().includes(e)) &&
    !PLATE_PATTERN.test(message)) {
    const emirateName = EMIRATES.find(e => message.toLowerCase().includes(e));
    const formattedName = emirateName.replace(/\b\w/g, c => c.toUpperCase());
    const promptReply = `To check fines for a vehicle in ${formattedName}, please provide the plate number. For example: "Check fines for plate DXB-5678"`;
    addToHistory(sid, 'user', message);
    addToHistory(sid, 'assistant', promptReply);
    return res.json({
      reply: promptReply,
      guardrail: { triggered: false },
      retrievedDocs: [], toolUsed: null,
      language: isArabic ? 'ar' : 'en',
      sessionId: sid,
      sessionTurns: session.history.length,
      topicChanged: false
    });
  }

  if (isShortFollowUp(message) && session.history.length >= 2) {
    // Find first user message in history with a topic keyword
    const topicMsg = session.history.filter(h => h.role === 'user')
      .find(m => detectTopicGroup(m.content) !== null);
    if (topicMsg) {
      retrievalQuery = `${topicMsg.content} ${message}`;
      console.log(`📎 Enriched: "${retrievalQuery.slice(0, 80)}..."`);
    } else if (session.currentTopic) {
      // All history is follow-ups — use stored topic group keywords
      const topicKeywords = TOPIC_GROUPS[session.currentTopic].join(' ');
      retrievalQuery = `${topicKeywords} ${message}`;
      console.log(`📎 Topic-enriched (${session.currentTopic}): "${retrievalQuery.slice(0, 80)}..."`);
    }
  }

  const docs = retrieveRelevantDocs(retrievalQuery);

  if (docs.length === 0) {
    const noResultReply = isArabic
      ? 'لم أتمكن من العثور على معلومات ذات صلة في قاعدة بيانات السياسات. يرجى زيارة البوابة الإلكترونية للإمارة المعنية للحصول على المساعدة.'
      : "I couldn't find relevant information in our policy database. Please visit the relevant UAE emirate portal for assistance.";
    return res.json({
      reply: noResultReply,
      guardrail: { triggered: false },
      retrievedDocs: [], toolUsed: null,
      language: isArabic ? 'ar' : 'en',
      sessionId: sid,
      sessionTurns: session.history.length,
      topicChanged: session.topicChanged
    });
  }

  // 6. Build prompt + call LLM with history
  const context = docs.map(d => `[${d.id}] ${d.title} (${d.emirate}):\n${d.content}`).join('\n\n');

  const languageInstruction = isArabic
    ? `\nالمستخدم يكتب بالعربية. يجب أن تجيب باللغة العربية الفصحى الحديثة بالكامل. احتفظ بمعرّفات السياسات مثل POL-001 باللغة الإنجليزية.`
    : `\nRespond in English.`;

  const systemPrompt = `${ACTIVE_SYSTEM_PROMPT}${languageInstruction}\n\nPOLICY CONTEXT:\n${context}`;

  try {
    const llmReply = await callOllama(systemPrompt, message, session.history);

    addToHistory(sid, 'user', message);
    addToHistory(sid, 'assistant', llmReply);

    return res.json({
      reply: llmReply,
      guardrail: { triggered: false },
      retrievedDocs: docs.map(d => ({ id: d.id, title: d.title, score: d.score })),
      toolUsed: null,
      language: isArabic ? 'ar' : 'en',
      sessionId: sid,
      sessionTurns: session.history.length,
      topicChanged: session.topicChanged
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
  console.log(`LLM: Groq API (llama-3.1-8b-instant)`);
  console.log(`Tool calling: fast pre-check + Groq native ✅`);
  console.log(`Memory: multi-turn + topic change detection ✅`);
  console.log(`Policies: ${policies.length} across all 7 emirates ✅`);
  console.log(`Arabic support: enabled ✅`);
});

module.exports = app;