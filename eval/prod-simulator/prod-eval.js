#!/usr/bin/env node
/**
 * GovMurshid Production Eval Simulator
 *
 * Simulates online evaluation of production traffic:
 * 1. Takes a sample of "real" user queries (English + Arabic)
 * 2. Sends them to GovMurshid
 * 3. Scores responses with LLM-as-judge via Groq SDK
 * 4. Records results in metrics store
 * 5. Flags failures for golden dataset feedback loop
 */

require('dotenv').config();
const { recordRun } = require('../observability/metrics-store');
const fs   = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const BASE_URL     = process.env.BASE_URL || 'http://localhost:3000';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groqClient   = new Groq({ apiKey: GROQ_API_KEY });

const PROD_TRAFFIC_SAMPLE = [
  // ── English queries ──────────────────────────────────
  {
    id: 'PROD-001',
    query: 'How do I renew my driving license in Abu Dhabi?',
    expectedTopics: ['Emirates ID', 'eye test', 'service center'],
    category: 'driving',
    language: 'en'
  },
  {
    id: 'PROD-002',
    query: 'What is the fine for overstaying my visa in UAE?',
    expectedTopics: ['AED 25', 'grace period', 'overstay'],
    category: 'identity',
    language: 'en'
  },
  {
    id: 'PROD-003',
    query: 'How do I connect electricity in my new Dubai apartment?',
    expectedTopics: ['DEWA', 'Ejari', 'deposit'],
    category: 'utilities',
    language: 'en'
  },
  {
    id: 'PROD-004',
    query: 'Can a foreigner buy property in Dubai?',
    expectedTopics: ['freehold', 'designated areas', 'registration'],
    category: 'housing',
    language: 'en'
  },
  {
    id: 'PROD-005',
    query: 'What is the minimum salary to sponsor family in UAE?',
    expectedTopics: ['AED 4,000', 'sponsorship', 'family'],
    category: 'identity',
    language: 'en'
  },
  {
    id: 'PROD-006',
    query: 'How do I get a freelance visa in UAE?',
    expectedTopics: ['free zone', 'permit', 'Shams'],
    category: 'business',
    language: 'en'
  },
  {
    id: 'PROD-007',
    query: 'What schools are regulated by KHDA in Dubai?',
    expectedTopics: ['KHDA', 'private school', 'Dubai'],
    category: 'education',
    language: 'en'
  },
  {
    id: 'PROD-008',
    query: 'How long does it take to process an Emirates ID renewal?',
    expectedTopics: ['3', '5', 'business days'],
    category: 'identity',
    language: 'en'
  },

  // ── Arabic queries ───────────────────────────────────
  {
    id: 'PROD-009',
    query: 'كيف أجدد رخصة القيادة في الإمارات؟',
    expectedTopics: ['الهوية الإماراتية', 'اختبار النظر', 'مركز الخدمة'],
    category: 'driving',
    language: 'ar'
  },
  {
    id: 'PROD-010',
    query: 'هل التأمين الصحي إلزامي في دبي؟',
    expectedTopics: ['إلزامي', 'دبي', 'صاحب العمل'],
    category: 'healthcare',
    language: 'ar'
  },
  {
    id: 'PROD-011',
    query: 'ما هي متطلبات تجديد تأشيرة الإقامة في الإمارات؟',
    expectedTopics: ['جواز السفر', 'الهوية الإماراتية', 'اللياقة الطبية'],
    category: 'identity',
    language: 'ar'
  },
  {
    id: 'PROD-012',
    query: 'كيف أسجل عقد الإيجار في دبي؟',
    expectedTopics: ['إيجاري', 'دبي', 'عقد الإيجار'],
    category: 'housing',
    language: 'ar'
  },
  {
    id: 'PROD-013',
    query: 'من يحق له التقدم للحصول على الإقامة الذهبية؟',
    expectedTopics: ['المستثمرون', 'المواهب', 'سنوات'],
    category: 'identity',
    language: 'ar'
  },
];

// ── Helpers ───────────────────────────────────────────────
async function sendChat(message) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return res.json();
}

async function judgeResponse(query, response, expectedTopics, language) {
  const isArabic = language === 'ar';

  const prompt = isArabic
    ? `أنت مقيّم جودة لمساعد ذكاء اصطناعي لخدمات حكومة الإمارات.

سؤال المستخدم: "${query}"
رد الذكاء الاصطناعي: "${response}"
المواضيع المتوقع تغطيتها: ${expectedTopics.join(', ')}

قيّم ما إذا كان الرد:
1. ذا صلة بالسؤال
2. يغطي على الأقل أحد المواضيع المتوقعة
3. باللغة العربية
4. مهني ودقيق

أجب فقط بكائن JSON هكذا:
{"pass": true, "score": 0.9, "reason": "سبب مختصر"}`
    : `You are a quality evaluator for a UAE government services AI assistant.

User query: "${query}"
AI response: "${response}"
Expected topics that should be covered: ${expectedTopics.join(', ')}

Evaluate if the response:
1. Is relevant to the query
2. Covers at least one of the expected topics
3. Is factual and professional
4. Does not contain harmful or incorrect information

Reply with ONLY a JSON object like this:
{"pass": true, "score": 0.9, "reason": "brief reason"}`;

  try {
    // Using Groq SDK instead of raw fetch to avoid response parsing issues
    const completion = await groqClient.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 200
    });

    const text = completion.choices[0].message.content.trim();
    const jsonMatch = text.match(/\{.*\}/s);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { pass: false, score: 0, reason: 'Could not parse judge response' };
  } catch (err) {
    return { pass: false, score: 0, reason: `Judge error: ${err.message}` };
  }
}

// ── Main ──────────────────────────────────────────────────
async function runProdEval() {
  console.log('🔍 GovMurshid Production Eval Simulator');
  console.log('════════════════════════════════════════\n');
  console.log(`Evaluating ${PROD_TRAFFIC_SAMPLE.length} sampled queries (English + Arabic)...\n`);

  const results  = [];
  const failures = [];

  for (const sample of PROD_TRAFFIC_SAMPLE) {
    const langTag = sample.language === 'ar' ? '🇦🇪' : '🇬🇧';
    process.stdout.write(`  ${langTag} [${sample.id}] ${sample.query.substring(0, 45)}... `);

    try {
      const chatResponse = await sendChat(sample.query);

      if (chatResponse.guardrail?.triggered) {
        console.log('🛡  GUARDRAIL (unexpected)');
        failures.push({ ...sample, reason: 'Unexpectedly blocked by guardrail' });
        results.push({ id: sample.id, pass: false, score: 0, category: sample.category, language: sample.language });
        continue;
      }

      const judgment = await judgeResponse(
        sample.query,
        chatResponse.reply,
        sample.expectedTopics,
        sample.language
      );

      if (judgment.pass) {
        console.log(`✅ PASS (score: ${judgment.score?.toFixed(2) || 'N/A'})`);
      } else {
        console.log(`❌ FAIL — ${judgment.reason}`);
        failures.push({ ...sample, actualResponse: chatResponse.reply, reason: judgment.reason });
      }

      results.push({
        id: sample.id,
        pass: judgment.pass,
        score: judgment.score || 0,
        category: sample.category,
        language: sample.language
      });

    } catch (err) {
      console.log(`💥 ERROR: ${err.message}`);
      results.push({ id: sample.id, pass: false, score: 0, category: sample.category, language: sample.language });
    }
  }

  // ── Summary ─────────────────────────────────────────────
  const passed   = results.filter(r => r.pass).length;
  const total    = results.length;
  const passRate = passed / total;

  const enResults = results.filter(r => r.language === 'en');
  const arResults = results.filter(r => r.language === 'ar');
  const enPassed  = enResults.filter(r => r.pass).length;
  const arPassed  = arResults.filter(r => r.pass).length;

  console.log('\n════════════════════════════════════════');
  console.log('📊 Production Eval Summary\n');
  console.log(`Overall:  ${passed}/${total} (${(passRate * 100).toFixed(1)}%)`);
  console.log(`🇬🇧 English: ${enPassed}/${enResults.length}`);
  console.log(`🇦🇪 Arabic:  ${arPassed}/${arResults.length}`);

  // Category breakdown
  const categories = {};
  for (const r of results) {
    if (!categories[r.category]) categories[r.category] = { pass: 0, total: 0 };
    categories[r.category].total++;
    if (r.pass) categories[r.category].pass++;
  }

  console.log('\nBy category:');
  for (const [cat, scores] of Object.entries(categories)) {
    const icon = scores.pass === scores.total ? '✅' : '⚠️ ';
    console.log(`  ${icon} ${cat.padEnd(12)} ${scores.pass}/${scores.total}`);
  }

  // Record in metrics store
  const run = { type: 'prod_eval', total, passed, passRate, categoryScores: categories };
  recordRun(run);
  console.log('\n📈 Results recorded in metrics store');

  // Feedback loop
  if (failures.length > 0) {
    console.log(`\n🔄 Feedback Loop — ${failures.length} failure(s) flagged for golden dataset:`);
    const feedbackPath = path.join(__dirname, '../../eval/golden-dataset/feedback-candidates.json');
    const existing = fs.existsSync(feedbackPath)
      ? JSON.parse(fs.readFileSync(feedbackPath, 'utf8'))
      : [];

    const newCandidates = failures.map(f => ({
      id: `FB-${Date.now()}-${f.id}`,
      source: 'prod_eval',
      date: new Date().toISOString(),
      category: f.category,
      language: f.language,
      input: f.query,
      expectedFacts: f.expectedTopics,
      failureReason: f.reason,
      status: 'pending_review'
    }));

    fs.writeFileSync(feedbackPath, JSON.stringify([...existing, ...newCandidates], null, 2));
    newCandidates.forEach(c => {
      console.log(`  → [${c.id}] "${c.input.substring(0, 50)}..."`);
      console.log(`    Reason: ${c.failureReason}`);
    });
    console.log(`\n  Saved to eval/golden-dataset/feedback-candidates.json`);
    console.log('  Review and promote to golden dataset via PR.\n');
  } else {
    console.log('\n✅ No failures — golden dataset feedback loop not triggered\n');
  }

  return passRate;
}

runProdEval()
  .then(rate => process.exit(rate >= 0.7 ? 0 : 1))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(2);
  });