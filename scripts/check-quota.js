#!/usr/bin/env node
/**
 * GovMurshid — Groq Quota Pre-Flight Check
 *
 * Problem this solves: `npm run eval` costs up to 33 Groq calls,
 * `npm run eval:bias` a few more, `npm run eval:prod` more still. Running
 * any of these without checking Groq's rate-limit state first is how you
 * end up mid-run, 429'd, with a partial result that then needs a full
 * re-run — burning quota twice for one clean number.
 *
 * IMPORTANT (confirmed via a real 429 during a live eval run): Groq's free
 * tier limits observed here reset in SECONDS, not a day — they're
 * per-minute (TPM/RPM) windows, not a daily total. This script's single
 * probe call can tell you the window is healthy RIGHT NOW; it cannot see a
 * burst mid-run when several large requests (GovMurshid's full-RAG-context
 * calls regularly need 4,000-5,200 of a 6,000 TPM budget) land close
 * together. Treat a clean result here as "safe to start", not "guaranteed
 * to finish without any 429s".
 *
 * This script makes exactly ONE minimal Groq call (max_tokens: 1) purely to
 * read the live rate-limit headers Groq returns on every response, then
 * tells you plainly whether the current window looks safe to start an
 * eval run. It does not run any eval itself.
 *
 * Usage: npm run check-quota
 */




require('dotenv').config();




const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'openai/gpt-oss-20b';




// Rough Groq-call costs of each expensive script, so this can give an
// honest "will X fit" answer rather than just raw numbers. These are
// upper-bound estimates from the project's own eval configs — keep them
// in sync if promptfoo.yaml or bias-check.js's case counts change.
const KNOWN_COSTS = [
  { script: 'npm run eval',              calls: 33 },
  { script: 'npm run eval:bias',         calls: 6  }, // 3 paired prompts x 2 judged calls-ish
  { script: 'npm run eval:prod',         calls: 13 },
  { script: 'npm run eval:deepeval:live',calls: 5  },
];




function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}




async function checkQuota() {
  if (!GROQ_API_KEY) {
    fail('GROQ_API_KEY not set in .env — cannot check quota without it.');
  }




  console.log('🔍 GovMurshid — Groq Quota Pre-Flight Check');
  console.log('════════════════════════════════════════════\n');
  console.log('Making one minimal call to read live rate-limit headers...\n');




  let res;
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1
      })
    });
  } catch (err) {
    fail(`Network error reaching Groq: ${err.message}`);
  }




  if (res.status === 429) {
    console.log('🚨 Quota is ALREADY exhausted — this probe call itself was rate-limited.');
    console.log('   Wait for the current per-minute window to refill (seconds, not a day) before retrying.\n');
    const retryAfter = res.headers.get('retry-after');
    if (retryAfter) console.log(`   Retry-After: ${retryAfter}s\n`);
    process.exit(1);
  }




  if (!res.ok && res.status !== 200) {
    const body = await res.text().catch(() => '');
    fail(`Groq returned ${res.status} on the probe call. Body: ${body.slice(0, 200)}`);
  }




  const h = (name) => res.headers.get(name);




  const limitRequests     = h('x-ratelimit-limit-requests');
  const remainingRequests = h('x-ratelimit-remaining-requests');
  const resetRequests     = h('x-ratelimit-reset-requests');
  const limitTokens       = h('x-ratelimit-limit-tokens');
  const remainingTokens   = h('x-ratelimit-remaining-tokens');
  const resetTokens       = h('x-ratelimit-reset-tokens');




  console.log('📊 Current rate-limit window (from live Groq response headers):\n');
  console.log(`  Requests : ${remainingRequests ?? '?'} / ${limitRequests ?? '?'} left in this window  (refills in ${resetRequests ?? '?'})`);
  console.log(`  Tokens   : ${remainingTokens ?? '?'} / ${limitTokens ?? '?'} left in this window  (refills in ${resetTokens ?? '?'})`);
  console.log('\n  ⚠️  These reset in seconds, not a day — this is Groq\'s per-minute (TPM/RPM)');
  console.log('      window, confirmed via a real 429: "tokens per minute (TPM): Limit 6000".');
  console.log('      A large single request (full RAG context) can already need 4,000-5,200');
  console.log('      tokens on its own. This check samples ONE instant — it cannot see a burst');
  console.log('      that happens mid-run when several large requests land close together.');
  console.log('      A green result here means quota is healthy right now, not that a long');
  console.log('      concurrent run is guaranteed to avoid every 429.');




  const remReq = Number(remainingRequests);
  const remTok = Number(remainingTokens);




  console.log('\n📋 Do the expensive scripts fit in the CURRENT window? (see burst caveat above)\n');
  for (const { script, calls } of KNOWN_COSTS) {
    const fitsRequests = Number.isFinite(remReq) ? remReq >= calls : null;
    const verdict = fitsRequests === null
      ? '❔ unknown (header missing)'
      : fitsRequests
        ? `✅ fits (~${calls} calls needed)`
        : `❌ WILL NOT complete cleanly (~${calls} calls needed, only ${remReq} left)`;
    console.log(`  ${script.padEnd(28)} ${verdict}`);
  }




  console.log('\n💡 Recommended order if you\'re seeing repeated 429s:');
  console.log('   1. npm run eval          (highest priority — the #1 unconfirmed number)');
  console.log('   2. npm run eval:bias     (needed for the first real bias scores)');
  console.log('   3. Everything else can wait a few minutes for the window to refill.\n');




  console.log('Zero-quota alternatives for iteration in the meantime:');
  console.log('   npm run test:unit        (Vitest, zero network)');
  console.log('   npm run eval:deepeval    (Context Precision/Recall, zero network)');
  console.log('   npm run eval:conversational (deterministic, zero Groq judge cost)\n');
}




checkQuota().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(2);
});


