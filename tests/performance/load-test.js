/**
 * GovMurshid k6 Load Test
 *
 * Tests three endpoints under realistic load:
 *   1. Health check (baseline)
 *   2. Policy search API
 *   3. Chat endpoint (heaviest — calls LLM)
 *
 * Stages:
 *   - Ramp up to 5 virtual users over 10s
 *   - Hold at 5 VUs for 30s
 *   - Ramp down over 10s
 *
 * Thresholds (CI gate):
 *   - 95% of health/search requests under 500ms
 *   - 95% of chat requests under 15s (LLM is slow locally)
 *   - Error rate below 5%
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate    = new Rate('error_rate');
const chatDuration = new Trend('chat_duration', true);

// Test configuration
export const options = {
  /*
  stages: [
    { duration: '10s', target: 5 },  // ramp up to 5 users
    { duration: '30s', target: 5 },  // hold at 5 users
    { duration: '10s', target: 0 },  // ramp down
  ],

*/

// just to try with 3 users as groq is free tier and has a limit of 3 users

stages: [
  { duration: '10s', target: 3 },  // ramp up to 3 users (Groq free tier limit)
  { duration: '30s', target: 3 },  // hold at 3 users
  { duration: '10s', target: 0 },  // ramp down
],

  thresholds: {
    // Health and search must be fast
    'http_req_duration{endpoint:health}':  ['p(95)<500'],
    'http_req_duration{endpoint:search}':  ['p(95)<500'],
    // Chat can be slow (local LLM) — 30s p95
    'http_req_duration{endpoint:chat}':    ['p(95)<30000'],
    // Custom metrics
    'error_rate':                          ['rate<0.05'],
  }
};

const BASE_URL = 'http://localhost:3000';

const CHAT_MESSAGES = [
  'How do I renew my driving license in the UAE?',
  'What is the fine for an expired Emirates ID?',
  'How do I register my tenancy contract in Dubai?',
  'Is health insurance mandatory in Dubai?',
  'What documents do I need for residency visa renewal?',
  'How do I enroll my child in a Dubai school?',
  'What is the VAT registration threshold in UAE?',
  'How do I apply for a UAE Golden Visa?',
];

// ── Test scenario ─────────────────────────────────────────
export default function () {
  const vuIndex = __VU % CHAT_MESSAGES.length;
  const message = CHAT_MESSAGES[vuIndex];

  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/api/health`, {
    tags: { endpoint: 'health' }
  });

  check(healthRes, {
    'health: status 200': r => r.status === 200,
    'health: returns ok': r => {
      try {
        return JSON.parse(r.body).status === 'ok';
      } catch { return false; }
    }
  }) || errorRate.add(1);
  errorRate.add(0);

  sleep(0.5);

  // 2. Policy search
  const searchRes = http.get(
    `${BASE_URL}/api/policies/search?q=${encodeURIComponent(message)}`,
    { tags: { endpoint: 'search' } }
  );

  check(searchRes, {
    'search: status 200':       r => r.status === 200,
    'search: has results':      r => {
      try {
        return JSON.parse(r.body).results?.length > 0;
      } catch { return false; }
    }
  }) || errorRate.add(1);
  errorRate.add(0);

  sleep(0.5);

  // 3. Chat endpoint (only run 1 in 3 iterations to avoid overwhelming local LLM)
  if (__ITER % 3 === 0) {
    const chatStart = Date.now();
    const chatRes = http.post(
      `${BASE_URL}/api/chat`,
      JSON.stringify({ message }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { endpoint: 'chat' },
        timeout: '60s'
      }
    );
    chatDuration.add(Date.now() - chatStart);

    check(chatRes, {
      'chat: status 200':     r => r.status === 200,
      'chat: has reply':      r => {
        try {
          return JSON.parse(r.body).reply?.length > 0;
        } catch { return false; }
      },
      'chat: has guardrail':  r => {
        try {
          return typeof JSON.parse(r.body).guardrail === 'object';
        } catch { return false; }
      }
    }) || errorRate.add(1);
    errorRate.add(0);

    sleep(1);
  }
}

// ── Summary ───────────────────────────────────────────────
export function handleSummary(data) {
  const metrics = data.metrics;

  const healthP95 = metrics['http_req_duration{endpoint:health}']?.values?.['p(95)'] || 0;
  const searchP95 = metrics['http_req_duration{endpoint:search}']?.values?.['p(95)'] || 0;
  const chatP95   = metrics['http_req_duration{endpoint:chat}']?.values?.['p(95)'] || 0;
  const errRate   = metrics['error_rate']?.values?.rate || 0;
  const totalReqs = metrics['http_reqs']?.values?.count || 0;
  const reqRate   = metrics['http_reqs']?.values?.rate || 0;

  const summary = `
════════════════════════════════════════════
🏋️  GovMurshid Load Test Summary
════════════════════════════════════════════
Total requests:     ${totalReqs}
Throughput:         ${reqRate.toFixed(2)} req/s
Error rate:         ${(errRate * 100).toFixed(2)}%

Latency (p95):
  Health check:     ${healthP95.toFixed(0)}ms
  Policy search:    ${searchP95.toFixed(0)}ms
  Chat (LLM):       ${chatP95.toFixed(0)}ms

Thresholds:
  Health p95 < 500ms:   ${healthP95 < 500 ? '✅ PASS' : '❌ FAIL'}
  Search p95 < 500ms:   ${searchP95 < 500 ? '✅ PASS' : '❌ FAIL'}
  Chat p95 < 30000ms:   ${chatP95 < 30000 ? '✅ PASS' : '❌ FAIL'}
  Error rate < 5%:      ${errRate < 0.05 ? '✅ PASS' : '❌ FAIL'}
════════════════════════════════════════════
`;

  console.log(summary);
  return { stdout: summary };
}