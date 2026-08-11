// ─────────────────────────────────────────
// GovMurshid — Supabase Client
// Adapted from Tawfeer's real, working connection pattern
// (src/utils/supabase.js in the sister project).
// ─────────────────────────────────────────


const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
}


const supabase = createClient(supabaseUrl, supabaseKey);


module.exports = { supabase };