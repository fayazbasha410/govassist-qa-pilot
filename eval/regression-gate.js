#!/usr/bin/env node
/**
 * GovMurshid Regression Gate
 *
 * Runs the Promptfoo eval, compares against baseline,
 * and fails ONLY if the drop exceeds the noise band.
 *
 * This avoids the false-positive trap:
 * - Per-case gating: 100 tests × 1% flip rate = 63% false failure rate
 * - Our approach: gate on aggregate pass RATE vs baseline within noise band
 *
 * Exit codes:
 *   0 = passed (no regression or within noise band)
 *   1 = regression detected (drop exceeds noise band)
 *   2 = error running eval
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────
const BASELINE_PATH = path.join(__dirname, 'baselines/baseline-v1.json');
const CONFIG_PATH   = path.join(__dirname, 'configs/promptfoo.yaml');
const NOISE_BAND    = 0.15; // allow up to 15% drop before flagging

// ── Load baseline ─────────────────────────────────────────
function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    console.error('❌ Baseline not found:', BASELINE_PATH);
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

// ── Run Promptfoo eval ────────────────────────────────────
function runEval() {
  console.log('🔄 Running Promptfoo eval...\n');
  try {
    const output = execSync(
      `promptfoo eval --config ${CONFIG_PATH} --output /tmp/govmurshid-eval.json --no-cache --max-concurrency 1`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    console.log(output);
  } catch (err) {
    // Promptfoo exits with non-zero when tests fail — that's ok, we handle it
    if (err.stdout) console.log(err.stdout);
  }

  const outputPath = '/tmp/govmurshid-eval.json';
  if (!fs.existsSync(outputPath)) {
    console.error('❌ Eval output not found — did promptfoo run correctly?');
    process.exit(2);
  }

  return JSON.parse(fs.readFileSync(outputPath, 'utf8'));
}

// ── Parse results ─────────────────────────────────────────
function parseResults(evalOutput) {
  const results = evalOutput.results?.results || [];

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  }

  const total = passed + failed;
  const passRate = total > 0 ? passed / total : 0;

  return { total, passed, failed, passRate };
}

// ── Compare against baseline ──────────────────────────────
function compareToBaseline(current, baseline) {
  const baselineRate = baseline.results.passRate;
  const currentRate  = current.passRate;
  const drop         = baselineRate - currentRate;
  const threshold    = baseline.noiseBand || NOISE_BAND;

  console.log('📊 Regression Gate Report');
  console.log('─────────────────────────────────────');
  console.log(`Baseline pass rate:  ${(baselineRate * 100).toFixed(1)}%`);
  console.log(`Current pass rate:   ${(currentRate * 100).toFixed(1)}%`);
  console.log(`Drop:                ${(drop * 100).toFixed(1)}%`);
  console.log(`Noise band:          ±${(threshold * 100).toFixed(1)}%`);
  console.log(`Minimum acceptable:  ${(baseline.minimumPassRate * 100).toFixed(1)}%`);
  console.log('─────────────────────────────────────');

  const regressionDetected = drop > threshold || currentRate < baseline.minimumPassRate;

  if (regressionDetected) {
    console.log('\n🚨 REGRESSION DETECTED');
    if (drop > threshold) {
      console.log(`   Drop of ${(drop * 100).toFixed(1)}% exceeds noise band of ${(threshold * 100).toFixed(1)}%`);
    }
    if (currentRate < baseline.minimumPassRate) {
      console.log(`   Pass rate ${(currentRate * 100).toFixed(1)}% is below minimum ${(baseline.minimumPassRate * 100).toFixed(1)}%`);
    }
    console.log('\n   Possible causes:');
    console.log('   - System prompt was changed');
    console.log('   - Model was swapped or updated');
    console.log('   - Policy documents were modified');
    console.log('   - Retrieval logic was changed');
    console.log('\n   Action: review recent changes and re-run eval before merging.\n');
    return true;
  }

  if (drop > 0) {
    console.log(`\n✅ WITHIN NOISE BAND — drop of ${(drop * 100).toFixed(1)}% is normal LLM variance`);
  } else {
    console.log('\n✅ NO REGRESSION — pass rate maintained or improved');
  }

  return false;
}

// ── Update baseline ───────────────────────────────────────
function updateBaseline(current, existing) {
  // Only update baseline if current is BETTER than existing
  if (current.passRate > existing.results.passRate) {
    const updated = {
      ...existing,
      date: new Date().toISOString().split('T')[0],
      results: {
        total: current.total,
        passed: current.passed,
        failed: current.failed,
        passRate: current.passRate
      }
    };
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(updated, null, 2));
    console.log(`📈 Baseline updated to ${(current.passRate * 100).toFixed(1)}%`);
  }
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log('🇦🇪 GovMurshid Regression Gate\n');

  const baseline   = loadBaseline();
  const evalOutput = runEval();
  const current    = parseResults(evalOutput);

  console.log(`\nResults: ${current.passed}/${current.total} passed (${(current.passRate * 100).toFixed(1)}%)\n`);

  const regressed = compareToBaseline(current, baseline);

  if (!regressed) {
    updateBaseline(current, baseline);
  }

  process.exit(regressed ? 1 : 0);
}

main().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(2);
});