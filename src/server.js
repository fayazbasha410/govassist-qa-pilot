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
// HELPERS
// ─────────────────────────────────────────

function retrieveRelevantDocs(query, topK = 3) {
  const queryWords = query.toLowerCase().split(/\s+/)
    .filter(w => w.length > 2);

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

// ─────────────────────────────────────────
// ARABIC DETECTION + TRANSLATION
// ─────────────────────────────────────────

// Detect if message contains Arabic characters
function detectArabic(text) {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

// Arabic query translation map — common Arabic gov service terms → English
// Used to translate Arabic queries into English keywords for RAG retrieval
function translateArabicQuery(text) {
  const translations = {
    // ── Driving ──────────────────────────────────────────
    'رخصة القيادة': 'driving license',
    'تجديد رخصة القيادة': 'driving license renewal',
    'رخصة': 'license',
    'القيادة': 'driving',
    'تجديد': 'renewal renew',
    // ── Fines ────────────────────────────────────────────
    'غرامة': 'fine',
    'غرامات': 'fines',
    'مخالفة': 'fine penalty',
    'مرور': 'traffic',
    // ── Vehicle ──────────────────────────────────────────
    'سيارة': 'vehicle',
    'تسجيل السيارة': 'vehicle registration',
    'تسجيل': 'registration',
    // ── Identity ─────────────────────────────────────────
    'الهوية الإماراتية': 'Emirates ID',
    'بطاقة الهوية': 'Emirates ID',
    'هوية': 'Emirates ID',
    'تأشيرة الإقامة': 'residency visa',
    'تأشيرة': 'visa',
    'إقامة ذهبية': 'golden visa',
    'الإقامة الذهبية': 'golden visa',
    'فيزا ذهبية': 'golden visa',
    'التقدم للحصول على الإقامة الذهبية': 'golden visa eligibility investors entrepreneurs',
    'إقامة': 'residency',
    'جواز سفر': 'passport',
    'شهادة ميلاد': 'birth certificate',
    // ── Healthcare ───────────────────────────────────────
    'التأمين الصحي إلزامي': 'health insurance mandatory DHA employer',
    'التأمين الصحي': 'health insurance DHA',
    'تأمين صحي': 'health insurance',
    'تأمين': 'insurance',
    'صحي': 'health',
    'إلزامي': 'mandatory required',
    'لياقة طبية': 'medical fitness',
    'فحص طبي': 'medical fitness',
    'شهادة لياقة': 'medical fitness certificate',
    // ── Education ────────────────────────────────────────
    'مدرسة': 'school',
    'تعليم': 'education',
    'تسجيل مدرسي': 'school enrollment',
    'التسجيل في المدرسة': 'school enrollment KHDA',
    // ── Housing ──────────────────────────────────────────
    'عقد الإيجار': 'tenancy contract',
    'عقد إيجار': 'tenancy contract',
    'إيجار': 'tenancy rental',
    'إيجاري': 'Ejari',
    'توثيق': 'Tawtheeq',
    'تسجيل عقد الإيجار': 'tenancy contract registration Ejari',
    // ── Business ─────────────────────────────────────────
    'ترخيص تجاري': 'trade license',
    'رخصة تجارية': 'trade license',
    'ضريبة القيمة المضافة': 'VAT Federal Tax Authority',
    'ضريبة': 'VAT tax',
    'عمل حر': 'freelance permit',
    'فريلانس': 'freelance',
    // ── Social ───────────────────────────────────────────
    'دعم اجتماعي': 'social support',
    'زكاة': 'Zakat',
    'معاش': 'pension gratuity',
    'مكافأة نهاية الخدمة': 'end of service gratuity',
    'نهاية الخدمة': 'end of service gratuity',
    'ذوي الهمم': 'people of determination disability',
    // ── Utilities ────────────────────────────────────────
    'كهرباء': 'electricity DEWA ADDC',
    'ماء': 'water utility',
    // ── Appointments ─────────────────────────────────────
    'حجز موعد': 'book appointment',
    'موعد': 'appointment',
    // ── Emirates ─────────────────────────────────────────
    'الإمارات': 'UAE emirates',
    'أبوظبي': 'Abu Dhabi',
    'دبي': 'Dubai',
    'الشارقة': 'Sharjah',
    'عجمان': 'Ajman',
    'رأس الخيمة': 'Ras Al Khaimah',
    'الفجيرة': 'Fujairah',
    'أم القيوين': 'Umm Al Quwain',
    // ── Common question words — translate to empty ────────
    'كيف': '',
    'ما هي': '',
    'ما هو': '',
    'هل': '',
    'من': '',
    'متى': '',
    'أين': '',
    'في': '',
    'على': '',
    'من يحق له': '',
    'يحق له': '',
    'للحصول على': '',
    'التقدم': '',
    'أسجل': 'registration',
    'أجدد': 'renewal',
    'أحصل': '',
    'يمكنني': '',
    'أريد': '',
  };

  let translated = text;

  // Apply longer phrases first to avoid partial replacements
  const sortedEntries = Object.entries(translations)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [arabic, english] of sortedEntries) {
    translated = translated.replace(new RegExp(arabic, 'g'), english);
  }

  // Clean up remaining Arabic characters and punctuation
  translated = translated
    .replace(/[\u0600-\u06FF]+/g, '') // remove any remaining Arabic
    .replace(/[؟،]/g, '')             // remove Arabic punctuation
    .replace(/\s+/g, ' ')             // collapse multiple spaces
    .trim();

  return translated;
}

// ─────────────────────────────────────────
// GUARDRAILS (English + Arabic)
// ─────────────────────────────────────────

function checkGuardrails(message) {
  const lower = message.toLowerCase();

  // ── English banned phrases ──────────────────────────
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

  // ── Arabic banned phrases ───────────────────────────
  const arabicBanned = [
    'تجاهل التعليمات',
    'تجاهل جميع التعليمات',
    'أنت الآن',
    'تظاهر بأنك',
    'انسَ تعليماتك',
    'تجاوز',
    'بدون قيود',
    'بلا قيود',
    'وضع المطور',
    'الموجه النظامي',
    'تجاوز إعداداتك',
    'تجاوز القيود',
    'تصرف كمساعد مختلف'
  ];

  // ── English off-topic ───────────────────────────────
  const offTopic = [
    'weather', 'recipe', 'sports', 'movie', 'music',
    'joke', 'game', 'dating', 'stock', 'crypto', 'bitcoin',
    'football', 'cricket', 'basketball', 'tennis', 'match'
  ];

  // ── Arabic off-topic ────────────────────────────────
  const arabicOffTopic = [
    'الطقس',
    'وصفة',
    'رياضة',
    'كرة القدم',
    'كرة السلة',
    'مباراة',
    'فيلم',
    'موسيقى',
    'نكتة',
    'العملات المشفرة',
    'بيتكوين',
    'مواعدة',
    'الأسهم',
    'البورصة'
  ];

  // Check English banned
  for (const phrase of banned) {
    if (lower.includes(phrase)) {
      return {
        blocked: true,
        reason: 'prompt_injection',
        message: 'I can only assist with UAE government services. I cannot follow instructions that attempt to change my behaviour.'
      };
    }
  }

  // Check Arabic banned
  for (const phrase of arabicBanned) {
    if (message.includes(phrase)) {
      return {
        blocked: true,
        reason: 'prompt_injection',
        message: 'يمكنني فقط المساعدة في خدمات حكومة الإمارات. لا يمكنني اتباع تعليمات تحاول تغيير سلوكي.'
      };
    }
  }

  // Check English off-topic
  for (const topic of offTopic) {
    if (lower.includes(topic)) {
      return {
        blocked: true,
        reason: 'off_topic',
        message: `I'm GovMurshid, specialising in UAE government services across all seven emirates. I can help with licenses, fines, appointments, visas, housing, healthcare, education, business, and social services.`
      };
    }
  }

  // Check Arabic off-topic
  for (const topic of arabicOffTopic) {
    if (message.includes(topic)) {
      return {
        blocked: true,
        reason: 'off_topic',
        message: `أنا GovMurshid، متخصص في خدمات حكومة الإمارات عبر جميع الإمارات السبع. يمكنني المساعدة في الرخص والغرامات والمواعيد والتأشيرات والإسكان والرعاية الصحية والتعليم والأعمال والخدمات الاجتماعية.`
      };
    }
  }

  return { blocked: false };
}

// ─────────────────────────────────────────
// LLM — GROQ API (active)
// ─────────────────────────────────────────

// Call Groq API (free tier — llama3 in the cloud)
// Replaced Ollama with Groq for cloud deployment capability
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/*
// Previous Groq call without retry logic — kept for reference
async function callOllama(systemPrompt, userMessage) {
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
}
*/

// Active Groq call with retry logic for rate limit handling (free tier = 6000 TPM)
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
        const waitMs = attempt * 6000; // 6s, 12s, 18s
        console.log(`⏳ Groq rate limit hit — waiting ${waitMs / 1000}s before retry ${attempt}/${retries}`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
}

// ─────────────────────────────────────────
// LLM — OLLAMA LOCAL (reference — commented out)
// ─────────────────────────────────────────

/*
// Use this to run fully locally without Groq API key
// Requires Ollama running with llama3.2 pulled: ollama pull llama3.2

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
*/

// ─────────────────────────────────────────
// TOOL INTENT DETECTION (English + Arabic)
// ─────────────────────────────────────────

function detectToolIntent(message) {
  const lower = message.toLowerCase();

  // Plate number match — works for both English and Arabic messages
  const plateMatch = message.match(/[A-Z]{2,3}-\d{3,4}/i);

  // Arabic intent keywords
  const isArabicFineCheck = /غرامة|غرامات|مخالفة|تحقق من|لوحة/.test(message);
  const isArabicBooking = /حجز موعد|أحجز|موعد/.test(message);

  // Fine check — English or Arabic
  if (plateMatch && (
    lower.includes('fine') ||
    lower.includes('plate') ||
    isArabicFineCheck
  )) {
    return { tool: 'checkFineStatus', params: { plateNumber: plateMatch[0] } };
  }

  // Appointment booking — English or Arabic
  if (lower.includes('book') || lower.includes('appointment') || isArabicBooking) {
    const services = ['driving-license', 'vehicle-registration', 'emirates-id', 'residency-visa', 'health-card'];
    const dateMatch = message.match(/\d{4}-\d{2}-\d{2}/);
    const serviceMatch = services.find(s =>
      lower.includes(s.replace('-', ' ')) || lower.includes(s)
    );

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', model: 'groq/llama-3.1-8b-instant', name: 'GovMurshid' });
});

// Policy search — returns raw retrieved docs (used by RAG eval tests)
app.get('/api/policies/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  const docs = retrieveRelevantDocs(q);
  res.json({ query: q, results: docs });
});

// Tool endpoints
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

  // 1. Guardrails check (English + Arabic)
  const guard = checkGuardrails(message);
  if (guard.blocked) {
    return res.json({
      reply: guard.message,
      guardrail: { triggered: true, reason: guard.reason },
      retrievedDocs: [],
      toolUsed: null
    });
  }

  // 2. Detect language early — needed for retrieval + tool replies
  const isArabic = detectArabic(message);

  // 3. Tool intent detection (agentic layer) — English + Arabic
  const toolIntent = detectToolIntent(message);
  if (toolIntent) {
    let toolResult;
    if (toolIntent.tool === 'checkFineStatus') {
      toolResult = checkFineStatus(toolIntent.params.plateNumber);
    } else if (toolIntent.tool === 'bookAppointment') {
      toolResult = bookAppointment(toolIntent.params.service, toolIntent.params.date);
    }

    // Reply in Arabic if message was in Arabic
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

    return res.json({
      reply: toolReply,
      guardrail: { triggered: false },
      retrievedDocs: [],
      toolUsed: { name: toolIntent.tool, params: toolIntent.params, result: toolResult },
      language: isArabic ? 'ar' : 'en'
    });
  }

  // 4. RAG — retrieve relevant policy docs
  // Translate Arabic query to English keywords before matching
  const retrievalQuery = isArabic ? translateArabicQuery(message) : message;
  const docs = retrieveRelevantDocs(retrievalQuery);

  if (docs.length === 0) {
    const noResultReply = isArabic
      ? 'لم أتمكن من العثور على معلومات ذات صلة في قاعدة بيانات السياسات. يرجى زيارة البوابة الإلكترونية للإمارة المعنية للحصول على المساعدة.'
      : "I couldn't find relevant information in our policy database. Please visit the relevant UAE emirate portal for assistance.";
    return res.json({
      reply: noResultReply,
      guardrail: { triggered: false },
      retrievedDocs: [],
      toolUsed: null,
      language: isArabic ? 'ar' : 'en'
    });
  }

  // 5. Build grounded prompt and call LLM
  const context = docs.map(d => `[${d.id}] ${d.title}:\n${d.content}`).join('\n\n');

  const languageInstruction = isArabic
    ? `\nالمستخدم يكتب بالعربية. يجب أن تجيب باللغة العربية الفصحى الحديثة بالكامل. احتفظ بمعرّفات السياسات مثل POL-001 باللغة الإنجليزية.`
    : `\nRespond in English.`;

  const systemPrompt = `${ACTIVE_SYSTEM_PROMPT}${languageInstruction}

POLICY CONTEXT:
${context}`;

  try {
    const llmReply = await callOllama(systemPrompt, message);
    res.json({
      reply: llmReply,
      guardrail: { triggered: false },
      retrievedDocs: docs.map(d => ({ id: d.id, title: d.title, score: d.score })),
      toolUsed: null,
      language: isArabic ? 'ar' : 'en'
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
  console.log(`Arabic support: enabled (detection + translation + guardrails + tool replies)`);
});

module.exports = app;