// ─────────────────────────────────────────
// GovMurshid — Supabase Client
// Adapted from Tawfeer's real, working connection pattern
// (src/utils/supabase.js in the sister project).
//
// AUDIT NOTE: found via a real Boot Smoke CI failure that createClient()
// throws SYNCHRONOUSLY when the URL is missing — not lazy the way this
// was first assumed. pr-checks.yml's Boot Smoke job deliberately has no
// Supabase secrets configured (it's meant to verify the app boots and
// answers basic requests with zero external credentials — same
// philosophy already applied to Groq elsewhere: "no Groq call" is in the
// step's own name). Session persistence being unavailable should degrade
// the app, not prevent it from starting at all. Constructing only when
// both env vars are actually present; `supabase` is `null` otherwise, and
// every caller (session.js) already has fail-open handling for a failed
// call — extended here to also handle a missing client, not just a
// failed one.
// ─────────────────────────────────────────


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;


let supabase = null;


if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY — running without persistent sessions.');
} else {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(supabaseUrl, supabaseKey);
}


module.exports = { supabase };


