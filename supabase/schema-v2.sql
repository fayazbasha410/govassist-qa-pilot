-- ═══════════════════════════════════════════════════════════════════════
-- GovMurshid — Supabase Schema Migration
-- v2 — adds users.emirate (optional preference, used by auth routes)
--
-- Run this AFTER schema-v1.sql, on the same project.
-- ═══════════════════════════════════════════════════════════════════════


alter table users add column if not exists emirate text;


-- No NOT NULL / CHECK constraint here on purpose — GovMurshid covers all
-- 7 emirates equally and emirate is an optional personalization
-- preference, not a hard requirement the way it is in Tawfeer (where it
-- drives real distance/centre calculations GovMurshid has no equivalent
-- of). Valid-value enforcement happens at the application layer
-- (src/routes/auth.js's VALID_EMIRATES check), not the database.


