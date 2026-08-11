#!/usr/bin/env node
/**
 * GovMurshid Performance Benchmark (over time)
 *
 * Measures real /api/chat response latency across the golden dataset,
 * appends the result to a persisted history file, and compares against
 * the recent rolling average using the same noise-band philosophy as
 * regression-gate.js — gate on the AGGREGATE trend, not any single call,
 * since individual LLM call latency is naturally noisy.
 *
 * Requires the real server running (this measures real performance,
 * so there's no meaningful "fast, zero-network" mode for this one —
 * unlike Context Precision/Recall, latency can't be computed offline).
 *
 * Exit codes:
 *   0 = no regression (or not enough history yet to compare)
 *   1 = latency regression detected (exceeds noise band vs rolling average)
 *   2 = error (server unreachable, etc.)
 */


const fs = require('fs');
const path = require('path');


const DATASET_PATH = path.join(__dirname, 'golden-dataset/uae-gov-services.json');
const HISTORY_PATH = path.join(__dirname, 'observability/performance-history.json');
const SERVER_URL = process.env.EVAL_SERVER_URL || 'http://localhost:3000';


const NOISE_BAND_MS = 2000;       // allow up to 2s slower than rolling average before flagging
const ROLLING_WINDOW = 5;         // compare against the average of the last N runs
const MIN_HISTORY_FOR_GATE = 2;   // need at least this many prior runs before gating at all


function loadDataset() {
  return JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
}


function loadHistory() {
  if (!fs.existsSync(HISTORY_PATH)) return { runs: [] };
  return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
}


function saveHistory(history) {
  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}


async function measureLatency(dataset) {
  const perCase = [];


  for (const c of dataset) {
    const start = Date.now();
    let res;
    try {
      res = await fetch(`${SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: c.input, sessionId: `perf-${c.id}` }),
      });
      await res.json();
    } catch (err) {
      throw new Error(`Could not reach server at ${SERVER_URL} — is it running? (${err.message})`);
    }
    const durationMs = Date.now() - start;
    perCase.push({ id: c.id, durationMs });
  }


  const durations = perCase.map(c => c.durationMs);
  const avgMs = durations.reduce((s, d) => s + d, 0) / durations.length;
  const maxMs = Math.max(...durations);
  const minMs = Math.min(...durations);
  const p95Ms = durations.slice().sort((a, b) => a - b)[Math.floor(durations.length * 0.95)];


  return { perCase, avgMs, maxMs, minMs, p95Ms, totalCases: durations.length };
}


function compareToRollingAverage(current, history) {
  const recentRuns = history.runs.slice(-ROLLING_WINDOW);


  if (recentRuns.length < MIN_HISTORY_FOR_GATE) {
    console.log(`ℹ️  Only ${recentRuns.length} prior run(s) recorded — need ${MIN_HISTORY_FOR_GATE} minimum before gating on trend.\n`);
    return { regressed: false, rollingAvgMs: null };
  }


  const rollingAvgMs = recentRuns.reduce((s, r) => s + r.avgMs, 0) / recentRuns.length;
  const delta = current.avgMs - rollingAvgMs;


  console.log('📊 Performance Trend Report');
  console.log('─'.repeat(50));
  console.log(`Rolling average (last ${recentRuns.length} runs): ${rollingAvgMs.toFixed(0)}ms`);
  console.log(`Current run average:                    ${current.avgMs.toFixed(0)}ms`);
  console.log(`Delta:                                   ${delta >= 0 ? '+' : ''}${delta.toFixed(0)}ms`);
  console.log(`Noise band:                              ±${NOISE_BAND_MS}ms`);
  console.log('─'.repeat(50));


  const regressed = delta > NOISE_BAND_MS;


  if (regressed) {
    console.log(`\n🚨 PERFORMANCE REGRESSION — current run is ${delta.toFixed(0)}ms slower than the rolling average, exceeding the ${NOISE_BAND_MS}ms noise band.`);
    console.log('   Possible causes: Groq API slowdown, RAG retrieval got slower (more policies to scan),');
    console.log('   larger system prompt (more conversation history), or network conditions.\n');
  } else {
    console.log(delta > 0
      ? `\n✅ WITHIN NOISE BAND — ${delta.toFixed(0)}ms slower is normal variance.\n`
      : `\n✅ NO REGRESSION — latency stable or improved.\n`);
  }


  return { regressed, rollingAvgMs };
}


async function main() {
  const dataset = loadDataset();
  const history = loadHistory();


  console.log('🇦🇪 GovMurshid Performance Benchmark\n');
  console.log(`Running ${dataset.length} cases against ${SERVER_URL}...\n`);


  const current = await measureLatency(dataset);


  console.log(`Avg: ${current.avgMs.toFixed(0)}ms | Min: ${current.minMs}ms | Max: ${current.maxMs}ms | P95: ${current.p95Ms}ms\n`);


  const { regressed, rollingAvgMs } = compareToRollingAverage(current, history);


  history.runs.push({
    date: new Date().toISOString(),
    avgMs: current.avgMs,
    minMs: current.minMs,
    maxMs: current.maxMs,
    p95Ms: current.p95Ms,
    totalCases: current.totalCases,
  });
  // Keep history bounded — no need to grow forever
  if (history.runs.length > 100) history.runs = history.runs.slice(-100);
  saveHistory(history);


  process.exit(regressed ? 1 : 0);
}


main().catch(err => {
  console.error('❌ Error running performance benchmark:', err.message);
  process.exit(2);
});