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


function detectArabic(text) {
 const arabicPattern = /[\u0600-\u06FF]/;
 return arabicPattern.test(text);
}


function translateArabicQuery(text) {
 const translations = {
   'رخصة القيادة': 'driving license',
   'تجديد رخصة القيادة': 'driving license renewal',
   'رخصة': 'license',
   'القيادة': 'driving',
   'تجديد': 'renewal renew',
   'غرامة': 'fine',
   'غرامات': 'fines',
   'مخالفة': 'fine penalty',
   'مرور': 'traffic',
   'سيارة': 'vehicle',
   'تسجيل السيارة': 'vehicle registration',
   'تسجيل': 'registration',
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
   'التأمين الصحي إلزامي': 'health insurance mandatory DHA employer',
   'التأمين الصحي': 'health insurance DHA',
   'تأمين صحي': 'health insurance',
   'تأمين': 'insurance',
   'صحي': 'health',
   'إلزامي': 'mandatory required',
   'لياقة طبية': 'medical fitness',
   'فحص طبي': 'medical fitness',
   'شهادة لياقة': 'medical fitness certificate',
   'مدرسة': 'school',
   'تعليم': 'education',
   'تسجيل مدرسي': 'school enrollment',
   'التسجيل في المدرسة': 'school enrollment KHDA',
   'عقد الإيجار': 'tenancy contract',
   'عقد إيجار': 'tenancy contract',
   'إيجار': 'tenancy rental',
   'إيجاري': 'Ejari',
   'توثيق': 'Tawtheeq',
   'تسجيل عقد الإيجار': 'tenancy contract registration Ejari',
   'ترخيص تجاري': 'trade license',
   'رخصة تجارية': 'trade license',
   'ضريبة القيمة المضافة': 'VAT Federal Tax Authority',
   'ضريبة': 'VAT tax',
   'عمل حر': 'freelance permit',
   'فريلانس': 'freelance',
   'دعم اجتماعي': 'social support',
   'زكاة': 'Zakat',
   'معاش': 'pension gratuity',
   'مكافأة نهاية الخدمة': 'end of service gratuity',
   'نهاية الخدمة': 'end of service gratuity',
   'ذوي الهمم': 'people of determination disability',
   'كهرباء': 'electricity DEWA ADDC',
   'ماء': 'water utility',
   'حجز موعد': 'book appointment',
   'موعد': 'appointment',
   'الإمارات': 'UAE emirates',
   'أبوظبي': 'Abu Dhabi',
   'دبي': 'Dubai',
   'الشارقة': 'Sharjah',
   'عجمان': 'Ajman',
   'رأس الخيمة': 'Ras Al Khaimah',
   'الفجيرة': 'Fujairah',
   'أم القيوين': 'Umm Al Quwain',
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
 const sortedEntries = Object.entries(translations)
   .sort((a, b) => b[0].length - a[0].length);


 for (const [arabic, english] of sortedEntries) {
   translated = translated.replace(new RegExp(arabic, 'g'), english);
 }


 translated = translated
   .replace(/[\u0600-\u06FF]+/g, '')
   .replace(/[؟،]/g, '')
   .replace(/\s+/g, ' ')
   .trim();


 return translated;
}


// ─────────────────────────────────────────
// GUARDRAILS (English + Arabic)
// ─────────────────────────────────────────


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


 const offTopic = [
   'weather', 'recipe', 'sports', 'movie', 'music',
   'joke', 'game', 'dating', 'stock', 'crypto', 'bitcoin',
   'football', 'cricket', 'basketball', 'tennis', 'match'
 ];


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


 for (const phrase of banned) {
   if (lower.includes(phrase)) {
     return {
       blocked: true,
       reason: 'prompt_injection',
       message: 'I can only assist with UAE government services. I cannot follow instructions that attempt to change my behaviour.'
     };
   }
 }


 for (const phrase of arabicBanned) {
   if (message.includes(phrase)) {
     return {
       blocked: true,
       reason: 'prompt_injection',
       message: 'يمكنني فقط المساعدة في خدمات حكومة الإمارات. لا يمكنني اتباع تعليمات تحاول تغيير سلوكي.'
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
// LLM — GROQ API
// ─────────────────────────────────────────


const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// Standard LLM call (RAG answers) — unchanged
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
       console.log(`⏳ Groq rate limit hit — waiting ${waitMs / 1000}s before retry ${attempt}/${retries}`);
       await new Promise(r => setTimeout(r, waitMs));
       continue;
     }
     throw err;
   }
 }
}


// ─────────────────────────────────────────
// 🆕 GROQ NATIVE TOOL CALLING
// ─────────────────────────────────────────
// Replaces the old keyword/regex detectToolIntent().
// The LLM reads the user message and decides whether to call a tool,
// which tool, and what parameters to extract — no regex needed.

// These are the tool definitions we hand to Groq.
// Groq reads the descriptions to understand when to use each tool.
const TOOL_DEFINITIONS = [
 {
   type: 'function',
   function: {
     name: 'checkFineStatus',
     description: 'Check outstanding traffic or government fines for a vehicle using its plate number. Use this when the user asks about fines, penalties, or unpaid amounts for a specific vehicle plate.',
     parameters: {
       type: 'object',
       properties: {
         plateNumber: {
           type: 'string',
           description: 'The vehicle plate number, e.g. AD-1234 or DXB-5678'
         }
       },
       required: ['plateNumber']
     }
   }
 },
 {
   type: 'function',
   function: {
     name: 'bookAppointment',
     description: 'Book a government service appointment for the user. Use this when the user wants to schedule or book an appointment for a specific service and date.',
     parameters: {
       type: 'object',
       properties: {
         service: {
           type: 'string',
           description: 'The service to book. Must be one of: driving-license, vehicle-registration, emirates-id, residency-visa, health-card',
           enum: ['driving-license', 'vehicle-registration', 'emirates-id', 'residency-visa', 'health-card']
         },
         date: {
           type: 'string',
           description: 'The appointment date in YYYY-MM-DD format, e.g. 2025-03-15'
         }
       },
       required: ['service', 'date']
     }
   }
 }
];


// 🆕 Ask Groq if this message needs a tool call.
// Returns the parsed tool call { tool, params } or null if no tool needed.
async function detectToolIntentWithLLM(message, retries = 3) {
 for (let attempt = 1; attempt <= retries; attempt++) {
   try {
     const completion = await groq.chat.completions.create({
       model: 'llama-3.1-8b-instant',
       messages: [
         {
           role: 'system',
           content: `You are a UAE government services assistant. Your only job right now is to decide if the user's message requires calling a tool. If the user is asking about fines or penalties for a specific vehicle plate, use checkFineStatus. If the user wants to book a government appointment for a specific service and date, use bookAppointment. If neither applies, do not call any tool.`
         },
         { role: 'user', content: message }
       ],
       tools: TOOL_DEFINITIONS,
       tool_choice: 'auto', // LLM decides — call a tool or not
       temperature: 0,      // deterministic for tool decisions
       max_tokens: 256      // tool calls are short
     });

     const responseMessage = completion.choices[0].message;

     // If Groq decided to call a tool, it puts it in tool_calls
     if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
       const toolCall = responseMessage.tool_calls[0];
       const toolName = toolCall.function.name;
       const toolParams = JSON.parse(toolCall.function.arguments);

       console.log(`🔧 LLM selected tool: ${toolName}`, toolParams);
       return { tool: toolName, params: toolParams };
     }

     // LLM decided no tool needed
     return null;

   } catch (err) {
     const isRateLimit = err.status === 429 || err.message?.includes('429');
     if (isRateLimit && attempt < retries) {
       const waitMs = attempt * 6000;
       console.log(`⏳ Groq rate limit (tool call) — waiting ${waitMs / 1000}s before retry ${attempt}/${retries}`);
       await new Promise(r => setTimeout(r, waitMs));
       continue;
     }
     // If tool detection fails, log and return null (fall through to RAG)
     console.error('⚠️ Tool detection LLM call failed:', err.message);
     return null;
   }
 }
}


// ─────────────────────────────────────────
// SYSTEM PROMPTS
// ─────────────────────────────────────────


const SYSTEM_PROMPT_PRODUCTION = `You are GovMurshid, an AI guide for UAE government services across all seven emirates — Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah.
Answer ONLY using the policy information provided below.
Do NOT add information that is not in the context.
Always mention which emirate a rule applies to if it differs across emirates.
Be concise, helpful, and professional.
If the answer is not in the context, say so clearly and suggest the user visit the relevant emirate portal.`;


const ACTIVE_SYSTEM_PROMPT = SYSTEM_PROMPT_PRODUCTION;


// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────


app.get('/api/health', (req, res) => {
 res.json({ status: 'ok', version: '2.0.0', model: 'groq/llama-3.1-8b-instant', name: 'GovMurshid', toolCalling: 'native' });
});


app.get('/api/policies/search', (req, res) => {
 const { q } = req.query;
 if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
 const docs = retrieveRelevantDocs(q);
 res.json({ query: q, results: docs });
});


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


// Main chat endpoint
app.post('/api/chat', async (req, res) => {
 const { message } = req.body;


 if (!message || typeof message !== 'string') {
   return res.status(400).json({ error: 'Missing or invalid message' });
 }


 // 1. Guardrails check (English + Arabic) — unchanged
 const guard = checkGuardrails(message);
 if (guard.blocked) {
   return res.json({
     reply: guard.message,
     guardrail: { triggered: true, reason: guard.reason },
     retrievedDocs: [],
     toolUsed: null
   });
 }


 // 2. Detect language — needed for tool replies + RAG retrieval
 const isArabic = detectArabic(message);


 // 3. 🆕 Tool intent detection — now uses Groq native tool calling
 //    The LLM reads the message and decides which tool to call (if any).
 //    Falls back gracefully to RAG if tool detection fails.
 const toolIntent = await detectToolIntentWithLLM(message);

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


 // 4. RAG — retrieve relevant policy docs — unchanged
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


 // 5. Build grounded prompt and call LLM — unchanged
 const context = docs.map(d => `[${d.id}] ${d.title}:\n${d.content}`).join('\n\n');


 const languageInstruction = isArabic
   ? `\nالمستخدم يكتب بالعربية. يجب أن تجيب باللغة العربية الفصحى الحديثة بالكامل. احتفظ بمعرّفات السياسات مثل POL-001 باللغة الإنجليزية.`
   : `\nRespond in English.`;


 const systemPrompt = `${ACTIVE_SYSTEM_PROMPT}${languageInstruction}\n\nPOLICY CONTEXT:\n${context}`;


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
 console.log(`Tool calling: Groq native function calling ✅`);
 console.log(`Arabic support: enabled (detection + translation + guardrails + tool replies)`);
});


module.exports = app;