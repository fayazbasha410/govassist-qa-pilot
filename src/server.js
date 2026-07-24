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
// SESSION / MULTI-TURN MEMORY
// ─────────────────────────────────────────

const sessions = new Map();
const SESSION_MAX_TURNS = 6;
const SESSION_TTL_MS = 30 * 60 * 1000;

const TOPIC_GROUPS = {
  driving:  ['driving', 'license', 'licence', 'vehicle', 'registration', 'traffic', 'fine', 'fines', 'plate', 'renew', 'renewal', 'road', 'car'],
  school:   ['school', 'education', 'enroll', 'enrollment', 'student', 'khda', 'adek', 'university', 'college', 'child', 'kindergarten', 'kg'],
  insurance:['insurance', 'health', 'dha', 'daman', 'coverage', 'medical', 'clinic', 'hospital'],
  visa:     ['visa', 'residency', 'residence', 'emirates id', 'eid', 'passport', 'golden', 'permit', 'immigration', 'ica'],
  housing:  ['housing', 'tenancy', 'tenant', 'rent', 'rental', 'ejari', 'tawtheeq', 'apartment', 'flat', 'property'],
  business: ['business', 'trade', 'license', 'freelance', 'vat', 'tax', 'commercial', 'company', 'startup', 'added', 'ded'],
  social:   ['social', 'support', 'gratuity', 'pension', 'disability', 'determination', 'zakat', 'welfare', 'end of service'],
  utilities:['electricity', 'water', 'dewa', 'addc', 'utility', 'bill'],
};

const EMIRATES = ['abu dhabi', 'dubai', 'sharjah', 'ajman', 'umm al quwain', 'ras al khaimah', 'fujairah', 'uaq', 'rak'];

function detectTopicGroup(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [group, keywords] of Object.entries(TOPIC_GROUPS)) {
    scores[group] = keywords.filter(k => lower.includes(k)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : null;
}

function detectEmirate(text) {
  const lower = text.toLowerCase();
  return EMIRATES.find(e => lower.includes(e)) || null;
}

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
  if (session.history.length > SESSION_MAX_TURNS * 2) {
    session.history = session.history.slice(-SESSION_MAX_TURNS * 2);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) sessions.delete(id);
  }
}, 10 * 60 * 1000);

// ─────────────────────────────────────────
// CONFIDENCE SCORING
// ─────────────────────────────────────────
//
// Scores how confident we are in the RAG answer based on:
// - topDoc score (how well the best doc matched)
// - score gap (how much better the top doc is vs second)
// - emirate match (did we find an emirate-specific policy?)
//
// Returns: { level: 'high'|'medium'|'low', label, policyId, reason }

function computeConfidence(docs, query) {
  if (!docs || docs.length === 0) {
    return { level: 'low', label: 'Low confidence', policyId: null, reason: 'No matching policies found' };
  }

  const top = docs[0];
  const second = docs[1];
  const topScore = top.score || 0;
  const scoreGap = second ? topScore - (second.score || 0) : topScore;
  const queryEmirate = detectEmirate(query);
  const emirateMatch = queryEmirate && (top.emirate || '').toLowerCase() === queryEmirate;

  let level, label, reason;

  if (topScore >= 8 && scoreGap >= 3) {
    level = 'high';
    label = 'High confidence';
    reason = emirateMatch
      ? `Matched emirate-specific policy ${top.id}`
      : `Strong match on ${top.id}`;
  } else if (topScore >= 5 || scoreGap >= 2) {
    level = 'medium';
    label = 'Medium confidence';
    reason = `Partial match — please verify at the official portal`;
  } else {
    level = 'low';
    label = 'Low confidence';
    reason = `Weak match — please verify at the relevant UAE portal`;
  }

  return { level, label, policyId: top.id, reason };
}

// ─────────────────────────────────────────
// FOLLOW-UP ENRICHMENT
// ─────────────────────────────────────────

const FOLLOW_UP_TRIGGERS = [
  /^how about (.+)/i,
  /^what about (.+)/i,
  /^and (.+)/i,
  /^in (.+)/i,
  /^for (.+)/i,
  /^what (about )?(.+)/i,
];

function isFollowUp(message) {
  const lower = message.trim().toLowerCase();
  if (lower.split(/\s+/).length <= 4 && EMIRATES.some(e => lower.includes(e))) return true;
  return FOLLOW_UP_TRIGGERS.some(r => r.test(lower));
}

function enrichFollowUp(message, session) {
  const detectedEmirate = detectEmirate(message);
  const detectedTopic = detectTopicGroup(message);
  const topic = detectedTopic || session.currentTopic;
  const emirate = detectedEmirate || session.currentEmirate;
  if (!topic && !emirate) return message;
  const topicKeywords = topic ? TOPIC_GROUPS[topic].slice(0, 3).join(' ') : '';
  const enriched = [topicKeywords, emirate].filter(Boolean).join(' ');
  console.log(`🧠 Follow-up enrichment: "${message}" → "${enriched}" (topic: ${topic}, emirate: ${emirate})`);
  return enriched;
}

// ─────────────────────────────────────────
// RAG RETRIEVAL — with emirate boost
// ─────────────────────────────────────────

function retrieveRelevantDocs(query, topK = 5) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const synonyms = {
    'expires':      ['expiry', 'expired', 'renewal', 'renew'],
    'expired':      ['expiry', 'expired', 'renewal'],
    'register':     ['registration', 'registered'],
    'registration': ['register', 'registered', 'mandatory', 'threshold'],
    'renew':        ['renewal', 'renewing', 'renewed'],
    'renewal':      ['renew', 'renewed'],
    'pay':          ['payment', 'paying', 'paid'],
    'payment':      ['pay', 'paid'],
    'apply':        ['application', 'applying'],
    'application':  ['apply', 'applying'],
    'mandatory':    ['required', 'compulsory', 'must'],
    'required':     ['mandatory', 'compulsory', 'requirement'],
    'documents':    ['document', 'documentation', 'requirements'],
    'license':      ['licence', 'licensed'],
    'fine':         ['fines', 'penalty', 'penalties'],
    'fines':        ['fine', 'penalty', 'penalties'],
    'school':       ['education', 'enrollment', 'enroll'],
    'enroll':       ['enrollment', 'school', 'education'],
    'insurance':    ['insured', 'coverage', 'health'],
    'tenancy':      ['tenant', 'rent', 'rental', 'contract'],
    'contract':     ['tenancy', 'rental', 'agreement'],
    'visa':         ['residency', 'residence', 'permit'],
    'benefits':     ['gratuity', 'entitlement', 'service'],
    'gratuity':     ['benefits', 'entitlement', 'end of service'],
    'trade':        ['business', 'commercial', 'license'],
    'vat':          ['tax', 'value added', 'federal tax', 'taxable', 'supplies'],
    'threshold':    ['exceeding', 'mandatory', 'registration', 'taxable'],
    'golden':       ['visa', 'long-term', 'residence'],
  };

  const expandedWords = new Set(queryWords);
  for (const word of queryWords) {
    const syns = synonyms[word] || [];
    syns.forEach(s => expandedWords.add(s));
  }

  const queryEmirate = detectEmirate(query);

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
    for (const word of queryWords) {
      if (doc.title.toLowerCase().includes(word)) score += 2;
    }

    if (queryEmirate) {
      const docEmirate = (doc.emirate || '').toLowerCase();
      if (docEmirate === queryEmirate) {
        score += 5;
      } else if (docEmirate === 'all uae' || docEmirate === 'uae') {
        score += 1;
      } else if (docEmirate && docEmirate !== queryEmirate) {
        score -= 2;
      }
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
    'رخصة القيادة':                      'driving license',
    'تجديد رخصة القيادة':               'driving license renewal',
    'رخصة':                              'license',
    'القيادة':                           'driving',
    'تجديد':                             'renewal renew',
    'غرامة':                             'fine',
    'غرامات':                            'fines',
    'مخالفة':                            'fine penalty',
    'مرور':                              'traffic',
    'سيارة':                             'vehicle',
    'تسجيل السيارة':                     'vehicle registration',
    'تسجيل':                             'registration',
    'الهوية الإماراتية':                 'Emirates ID',
    'بطاقة الهوية':                      'Emirates ID',
    'هوية':                              'Emirates ID',
    'تأشيرة الإقامة':                    'residency visa',
    'تأشيرة':                            'visa',
    'إقامة ذهبية':                       'golden visa',
    'الإقامة الذهبية':                   'golden visa',
    'فيزا ذهبية':                        'golden visa',
    'التقدم للحصول على الإقامة الذهبية': 'golden visa eligibility investors entrepreneurs',
    'إقامة':                             'residency',
    'جواز سفر':                          'passport',
    'شهادة ميلاد':                       'birth certificate',
    'التأمين الصحي إلزامي':              'health insurance mandatory DHA employer',
    'التأمين الصحي':                     'health insurance DHA',
    'تأمين صحي':                         'health insurance',
    'تأمين':                             'insurance',
    'صحي':                               'health',
    'إلزامي':                            'mandatory required',
    'لياقة طبية':                        'medical fitness',
    'فحص طبي':                           'medical fitness',
    'شهادة لياقة':                       'medical fitness certificate',
    'مدرسة':                             'school',
    'تعليم':                             'education',
    'تسجيل مدرسي':                       'school enrollment',
    'التسجيل في المدرسة':                'school enrollment KHDA',
    'عقد الإيجار':                       'tenancy contract',
    'عقد إيجار':                         'tenancy contract',
    'إيجار':                             'tenancy rental',
    'إيجاري':                            'Ejari',
    'توثيق':                             'Tawtheeq',
    'تسجيل عقد الإيجار':                 'tenancy contract registration Ejari',
    'ترخيص تجاري':                       'trade license',
    'رخصة تجارية':                       'trade license',
    'ضريبة القيمة المضافة':              'VAT Federal Tax Authority',
    'ضريبة':                             'VAT tax',
    'عمل حر':                            'freelance permit',
    'فريلانس':                           'freelance',
    'دعم اجتماعي':                       'social support',
    'زكاة':                              'Zakat',
    'معاش':                              'pension gratuity',
    'مكافأة نهاية الخدمة':               'end of service gratuity',
    'نهاية الخدمة':                      'end of service gratuity',
    'ذوي الهمم':                         'people of determination disability',
    'كهرباء':                            'electricity DEWA ADDC',
    'ماء':                               'water utility',
    'حجز موعد':                          'book appointment',
    'موعد':                              'appointment',
    'الإمارات':                          'UAE emirates',
    'أبوظبي':                            'Abu Dhabi',
    'دبي':                               'Dubai',
    'الشارقة':                           'Sharjah',
    'عجمان':                             'Ajman',
    'رأس الخيمة':                        'Ras Al Khaimah',
    'الفجيرة':                           'Fujairah',
    'أم القيوين':                        'Umm Al Quwain',
    'كيف': '', 'ما هي': '', 'ما هو': '', 'هل': '', 'من': '',
    'متى': '', 'أين': '', 'في': '', 'على': '', 'من يحق له': '',
    'يحق له': '', 'للحصول على': '', 'التقدم': '',
    'أسجل': 'registration', 'أجدد': 'renewal',
    'أحصل': '', 'يمكنني': '', 'أريد': '',
  };

  let translated = text;
  const sortedEntries = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
  for (const [arabic, english] of sortedEntries) {
    translated = translated.replace(new RegExp(arabic, 'g'), english);
  }
  return translated
    .replace(/[\u0600-\u06FF]+/g, '')
    .replace(/[؟،]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─────────────────────────────────────────
// GUARDRAILS
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
    'فيلم', 'موسيقى', 'نكتة', 'العملات المشفرة', 'بيتكوين', 'مواعدة',
    'الأسهم', 'البورصة'
  ];

  for (const p of banned) {
    if (lower.includes(p)) return { blocked: true, reason: 'prompt_injection', message: 'I can only assist with UAE government services. I cannot follow instructions that attempt to change my behaviour.' };
  }
  for (const p of arabicBanned) {
    if (message.includes(p)) return { blocked: true, reason: 'prompt_injection', message: 'يمكنني فقط المساعدة في خدمات حكومة الإمارات. لا يمكنني اتباع تعليمات تحاول تغيير سلوكي.' };
  }
  for (const t of offTopic) {
    if (lower.includes(t)) return { blocked: true, reason: 'off_topic', message: `I'm GovMurshid, specialising in UAE government services across all seven emirates. I can help with licenses, fines, appointments, visas, housing, healthcare, education, business, and social services.` };
  }
  for (const t of arabicOffTopic) {
    if (message.includes(t)) return { blocked: true, reason: 'off_topic', message: `أنا GovMurshid، متخصص في خدمات حكومة الإمارات عبر جميع الإمارات السبع.` };
  }
  return { blocked: false };
}

// ─────────────────────────────────────────
// LLM — GROQ API
// ─────────────────────────────────────────

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callOllama(systemPrompt, userMessage, retries = 3) {
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
        const waitMs = attempt * 6000;
        console.log(`⏳ Groq rate limit — waiting ${waitMs / 1000}s (retry ${attempt}/${retries})`);
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
      name: 'checkFineStatus',
      description: 'Check outstanding traffic or government fines for a vehicle using its plate number.',
      parameters: {
        type: 'object',
        properties: {
          plateNumber: { type: 'string', description: 'The vehicle plate number, e.g. AD-1234 or DXB-5678' }
        },
        required: ['plateNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'bookAppointment',
      description: 'Book a government service appointment for a specific service and date.',
      parameters: {
        type: 'object',
        properties: {
          service: {
            type: 'string',
            enum: ['driving-license', 'vehicle-registration', 'emirates-id', 'residency-visa', 'health-card']
          },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' }
        },
        required: ['service', 'date']
      }
    }
  }
];

async function detectToolIntentWithLLM(message, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'UAE government services assistant. Use checkFineStatus for vehicle fines, bookAppointment for scheduling. If neither applies, do not call any tool.' },
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
Answer ONLY using the policy information provided below.
Do NOT add information that is not in the context.
When an emirate is specified, focus your answer on that emirate's policies specifically.
Always mention which emirate a rule applies to if it differs across emirates.
Be concise, helpful, and professional.
If the answer is not in the context, say so clearly and suggest the user visit the relevant emirate portal.`;

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

// Silence favicon 404
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '3.4.0',
    model: 'groq/llama-3.1-8b-instant',
    name: 'GovMurshid',
    toolCalling: 'native',
    memory: 'session-based',
    confidenceScoring: true,
  });
});

app.get('/api/policies/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  const docs = retrieveRelevantDocs(q);
  res.json({ query: q, results: docs });
});

app.get('/api/tools/fines/:plateNumber', (req, res) => {
  res.json(checkFineStatus(req.params.plateNumber));
});

app.post('/api/tools/appointment', (req, res) => {
  const { service, date } = req.body;
  if (!service || !date) return res.status(400).json({ error: 'Missing service or date' });
  res.json(bookAppointment(service, date));
});

app.delete('/api/session/:sessionId', (req, res) => {
  sessions.delete(req.params.sessionId);
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
    });
  }

  // ── 2. Language detection ──────────────────────────────────────────
  const isArabic = detectArabic(message);

  // ── 3. Session + memory ────────────────────────────────────────────
  const sid = sessionId || 'default';
  const session = getSession(sid);

  const incomingTopic   = detectTopicGroup(message);
  const incomingEmirate = detectEmirate(message);
  const topicChanged    = incomingTopic && session.currentTopic && incomingTopic !== session.currentTopic;

  if (incomingTopic)   session.currentTopic   = incomingTopic;
  if (incomingEmirate) session.currentEmirate = incomingEmirate;
  session.topicChanged = topicChanged;

  if (topicChanged || session.topicTurns === 0) {
    session.topicTurns = 1;
  } else {
    session.topicTurns += 1;
  }

  // ── 4. Follow-up enrichment ────────────────────────────────────────
  const followUp = isFollowUp(message) && (session.currentTopic || session.currentEmirate);
  let retrievalMessage = message;
  if (followUp) retrievalMessage = enrichFollowUp(message, session);

  // ── 5. Tool intent detection (only if plate/booking keyword present) ──
  const PLATE_PATTERN   = /\b[A-Z]{1,3}[-\s]?\d{1,5}\b/i;
  const BOOKING_KEYWORDS = ['book', 'appointment', 'schedule', 'reserve', 'slot'];
  const mightNeedTool   = PLATE_PATTERN.test(message) ||
    BOOKING_KEYWORDS.some(k => message.toLowerCase().includes(k));

  const toolIntent = mightNeedTool ? await detectToolIntentWithLLM(message) : null;

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

    addToHistory(session, 'user', message);
    addToHistory(session, 'assistant', toolReply);

    return res.json({
      reply: toolReply,
      guardrail: { triggered: false },
      retrievedDocs: [],
      toolUsed: { name: toolIntent.tool, params: toolIntent.params, result: toolResult },
      language: isArabic ? 'ar' : 'en',
      memory: { turns: session.topicTurns, topic: session.currentTopic, emirate: session.currentEmirate },
      confidence: { level: 'high', label: 'Tool result', policyId: null, reason: 'Live data from government system' },
    });
  }

  // ── 6. RAG retrieval ──────────────────────────────────────────────
  const retrievalQuery = isArabic ? translateArabicQuery(retrievalMessage) : retrievalMessage;
  const topK = followUp ? 2 : 5;
  const docs = retrieveRelevantDocs(retrievalQuery, topK);

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
      confidence: { level: 'low', label: 'Low confidence', policyId: null, reason: 'No matching policies found' },
    });
  }

  // ── 7. Confidence scoring ─────────────────────────────────────────
  const confidence = computeConfidence(docs, retrievalQuery);

  // ── 8. Build prompt ───────────────────────────────────────────────
  const context = docs.map(d => `[${d.id}] ${d.title} (${d.emirate || 'UAE'}):\n${d.content}`).join('\n\n');

  const languageInstruction = isArabic
    ? `\nالمستخدم يكتب بالعربية. يجب أن تجيب باللغة العربية الفصحى الحديثة بالكامل. احتفظ بمعرّفات السياسات مثل POL-001 باللغة الإنجليزية.`
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

  // ── 9. LLM call ───────────────────────────────────────────────────
  try {
    const llmReply = await callOllama(systemPrompt, message);

    addToHistory(session, 'user', message);
    addToHistory(session, 'assistant', llmReply);

    res.json({
      reply: llmReply,
      guardrail: { triggered: false },
      retrievedDocs: docs.map(d => ({ id: d.id, title: d.title, score: d.score, emirate: d.emirate })),
      toolUsed: null,
      language: isArabic ? 'ar' : 'en',
      memory: { turns: session.topicTurns, topic: session.currentTopic, emirate: session.currentEmirate, topicChanged },
      confidence,
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
  console.log(`GovMurshid v3.4.0 running at http://localhost:${PORT}`);
  console.log(`LLM: Groq API (llama-3.1-8b-instant)`);
  console.log(`Tool calling: Groq native function calling ✅`);
  console.log(`Multi-turn memory: session-based (${SESSION_MAX_TURNS} turns, 30min TTL) ✅`);
  console.log(`Emirate boost scoring: enabled ✅`);
  console.log(`Confidence scoring: enabled ✅`);
  console.log(`Arabic support: enabled ✅`);
});

module.exports = app;