// ─────────────────────────────────────────
// GovMurshid — Auth Routes
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
//
// Adapted from Tawfeer's real, working pattern (src/routes/auth.js in the
// sister project) — bcrypt password hashing, opaque bearer tokens stored
// in Supabase, not JWT. DELIBERATE IMPROVEMENT over Tawfeer's version:
// tokens have a real expiry here (Tawfeer's user_sessions table has none
// at all — a flagged, documented gap in the sister project, see the
// project status doc, Part 4).
// ─────────────────────────────────────────


const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabase } = require('../lib/supabaseClient');


const TOKEN_EXPIRY_DAYS = 30;
const DANGEROUS_PATTERN = /<|>|script|drop\s+table|insert\s+into|delete\s+from|select\s+\*/i;


// GovMurshid covers all 7 emirates — emirate is an OPTIONAL preference
// here (unlike Tawfeer, where it's required for distance/centre
// calculations GovMurshid has no equivalent of). A saved preference can
// pre-focus RAG retrieval toward that emirate on future chats, but
// nothing about registration or login depends on it being set.
const VALID_EMIRATES = [
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman',
  'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah',
];


function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}


function supabaseUnavailable(res) {
  res.status(503).json({
    success: false,
    code: 'SERVICE_UNAVAILABLE',
    error: 'Account services are temporarily unavailable. You can still chat without an account.',
  });
}


// ── POST /api/auth/register ──────────────────────────────────────────
router.post('/register', async (req, res) => {
  if (!supabase) return supabaseUnavailable(res);


  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const emirate = (req.body.emirate || '').trim() || null;


  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }
  if (emirate && !VALID_EMIRATES.includes(emirate)) {
    return res.status(400).json({ success: false, error: 'Invalid emirate.' });
  }
  if (name.length > 200) {
    return res.status(400).json({ success: false, error: 'Name too long.' });
  }
  if (DANGEROUS_PATTERN.test(name)) {
    return res.status(400).json({ success: false, error: 'Invalid characters in name.' });
  }


  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();


    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'EMAIL_EXISTS',
        error: 'An account with this email already exists. Please sign in.',
      });
    }


    const passwordHash = bcrypt.hashSync(password, 10);


    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, password_hash: passwordHash, emirate }])
      .select()
      .single();


    if (insertError) throw insertError;


    const token = generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();


    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert([{ user_id: user.id, token, expires_at: expiresAt }]);


    if (sessionError) throw sessionError;


    return res.json({
      success: true,
      token,
      expiresAt,
      user: { id: user.id, name: user.name, email: user.email, emirate: user.emirate },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});


// ── POST /api/auth/login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  if (!supabase) return supabaseUnavailable(res);


  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';


  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }


  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();


    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        error: 'No account found with this email.',
      });
    }


    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        code: 'WRONG_PASSWORD',
        error: 'Incorrect password.',
      });
    }


    const token = generateToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();


    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert([{ user_id: user.id, token, expires_at: expiresAt }]);


    if (sessionError) throw sessionError;


    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);


    return res.json({
      success: true,
      token,
      expiresAt,
      user: { id: user.id, name: user.name, email: user.email, emirate: user.emirate },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});


// ── POST /api/auth/logout ────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  // Deliberately succeeds even if Supabase is unavailable or the token is
  // missing/invalid — logging out should never get a user "stuck".
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();


  if (!supabase || !token) {
    return res.json({ success: true });
  }


  try {
    await supabase.from('user_sessions').delete().eq('token', token);
  } catch (err) {
    console.error('Logout error (non-fatal):', err.message);
  }
  return res.json({ success: true });
});


module.exports = router;


