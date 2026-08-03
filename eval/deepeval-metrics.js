#!/usr/bin/env node
/**
 * GovMurshid DeepEval-style Metrics
 *
 * Reimplements 3 of DeepEval's metrics using the project's own stack
 * (Node + the existing golden dataset) instead of pulling in Python
 * DeepEval as a second runtime:
 *
 *   - Context Precision  — of what was retrieved, how much was relevant?
 *   - Context Recall     — of what was relevant, how much got retrieved?
 *   - Hallucination      — does the LLM's reply only cite policies that
 *                          were actually retrieved? (reuses the Step 6
 *                          groundedness guard from src/lib/outputGuardrails)
 *
 * Two modes:
 *   node eval/deepeval-metrics.js          — Context Precision/Recall only.
 *                                            Zero network calls, zero Groq
 *                                            quota, runs in milliseconds.
 *   node eval/deepeval-metrics.js --live    — adds Hallucination Detection,
 *                                            which requires the real server
 *                                            running at localhost:3000 (it
 *                                            needs actual LLM replies to
 *                                            check groundedness against).
 *
 * Exit codes:
 *   0 = all thresholds met
 *   1 = one or more metrics below threshold
 *   2 = error (e.g. --live passed but server unreachable)
 */


const path = require('path');
const fs = require('fs');


const policies = require('../src/data/policies');
const { retrieveRelevantDocs } = require('../src/lib/ragEngine');
const { detectArabic } = require('../src/lib/textDetection');
const { translateArabicQuery } = require('../src/lib/arabicTranslation');
const { checkGroundedness } = require('../src/lib/outputGuardrails');


const DATASET_PATH = path.join(__dirname, 'golden-dataset/uae-gov-services.json');
const SERVER_URL = process.env.EVAL_SERVER_URL || 'http://localhost:3000';


// Thresholds — deliberately conservative for a keyword-based RAG engine
// (not embeddings), tuned against this project's actual verified baseline
// rather than picked arbitrarily.
const THRESHOLDS = {
  recallAt5: 0.90,      // expected policy should almost always appear in top-5
  precisionAt1: 0.80,   // expected policy should usually be the #1 result
  groundedRate: 0.90,   // LLM should rarely cite a policy that wasn't retrieved
};


function loadDataset() {
  return JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));
}


function computeContextMetrics(dataset) {
  const perCase = [];


  for (const c of dataset) {
    const query = detectArabic(c.input) ? translateArabicQuery(c.input) : c.input;
    const results = retrieveRelevantDocs(query, policies, 5);
    const retrievedIds = results.map(r => r.id);
    const expected = c.expectedPolicyIds || [];


    const intersection = expected.filter(id => retrievedIds.includes(id));
    const recall = expected.length > 0 ? intersection.length / expected.length : null;
    const top1Match = retrievedIds.length > 0 && expected.includes(retrievedIds[0]);
    // Precision@5 is intentionally NOT the headline number here — with a
    // single expected policy per case and a fixed top-5 window, precision@5
    // is structurally capped around 20% even for a perfect system. Recall@5
    // and Precision@1 (is the expected doc actually ranked first?) are the
    // metrics that carry real signal for this dataset shape.
    const precisionAt5 = retrievedIds.length > 0 ? intersection.length / retrievedIds.length : null;


    perCase.push({
      id: c.id,
      input: c.input,
      expected,
      retrieved: retrievedIds,
      recall,
      precisionAt5,
      top1Match,
    });
  }


  const withRecall = perCase.filter(c => c.recall !== null);
  const avgRecall = withRecall.reduce((s, c) => s + c.recall, 0) / withRecall.length;
  const avgPrecisionAt5 = perCase.reduce((s, c) => s + (c.precisionAt5 || 0), 0) / perCase.length;
  const precisionAt1Rate = perCase.filter(c => c.top1Match).length / perCase.length;


  return { perCase, avgRecall, avgPrecisionAt5, precisionAt1Rate };
}


async function computeHallucinationMetric(dataset) {
  const perCase = [];


  for (const c of dataset) {
    let res;
    try {
      res = await fetch(`${SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: c.input, sessionId: `deepeval-${c.id}` }),
      });
    } catch (err) {
      throw new Error(`Could not reach server at ${SERVER_URL} — is it running? (${err.message})`);
    }


    if (!res.ok) {
      perCase.push({ id: c.id, error: `HTTP ${res.status}`, grounded: null });
      continue;
    }


    const body = await res.json();
    // IMPORTANT: read the outputGuardrail field server.js already computed
    // at the point the LLM's RAW reply came back — not something derived
    // from body.reply, which by this point has already had any fabricated
    // citation stripped out by the Step 6 guardrail. Checking the final
    // reply would make every case look "grounded" regardless of what the
    // model actually did, since the evidence is already gone.
    if (!body.outputGuardrail) {
      perCase.push({ id: c.id, error: 'no outputGuardrail field in response (guardrail path not triggered — was this a guardrail-blocked or tool-use turn?)', grounded: null });
      continue;
    }


    perCase.push({
      id: c.id,
      grounded: body.outputGuardrail.grounded,
      citedIds: body.outputGuardrail.citedIds,
      unknownIds: body.outputGuardrail.unknownIds,
    });
  }


  const withResult = perCase.filter(c => c.grounded !== null && c.grounded !== undefined);
  const groundedRate = withResult.length > 0
    ? withResult.filter(c => c.grounded).length / withResult.length
    : null;


  return { perCase, groundedRate };
}


function printReport(contextMetrics, hallucinationMetrics) {
  console.log('🇦🇪 GovMurshid DeepEval-style Metrics\n');
  console.log('─'.repeat(60));
  console.log('CONTEXT RECALL @5');
  console.log(`  ${(contextMetrics.avgRecall * 100).toFixed(1)}% (threshold: ${(THRESHOLDS.recallAt5 * 100).toFixed(0)}%)`);
  console.log('  → Of the policies that SHOULD answer each question, how many');
  console.log('    actually appeared somewhere in the top-5 retrieved results.\n');


  console.log('CONTEXT PRECISION @1 (top result is the expected policy)');
  console.log(`  ${(contextMetrics.precisionAt1Rate * 100).toFixed(1)}% (threshold: ${(THRESHOLDS.precisionAt1 * 100).toFixed(0)}%)`);
  console.log('  → Of all cases, how often the #1 ranked result was the correct one.\n');


  console.log(`CONTEXT PRECISION @5 (informational — see note in source)`);
  console.log(`  ${(contextMetrics.avgPrecisionAt5 * 100).toFixed(1)}%  — structurally capped low; not gated on\n`);


  const weakCases = contextMetrics.perCase.filter(c => !c.top1Match);
  if (weakCases.length > 0) {
    console.log(`  Cases where expected policy was retrieved but NOT ranked #1:`);
    for (const c of weakCases) {
      console.log(`    - ${c.id}: expected [${c.expected.join(',')}], got top-5 [${c.retrieved.join(', ')}]`);
    }
    console.log('');
  }


  if (hallucinationMetrics) {
    console.log('─'.repeat(60));
    console.log('HALLUCINATION / GROUNDEDNESS (live)');
    console.log(`  ${(hallucinationMetrics.groundedRate * 100).toFixed(1)}% grounded (threshold: ${(THRESHOLDS.groundedRate * 100).toFixed(0)}%)`);
    const ungrounded = hallucinationMetrics.perCase.filter(c => c.grounded === false);
    if (ungrounded.length > 0) {
      console.log(`  Ungrounded cases (cited a policy that wasn't retrieved):`);
      for (const c of ungrounded) {
        console.log(`    - ${c.id}: fabricated citation(s) [${c.unknownIds.join(', ')}]`);
      }
    }
    console.log('');
  } else {
    console.log('─'.repeat(60));
    console.log('HALLUCINATION / GROUNDEDNESS: skipped (run with --live to include)\n');
  }
}


async function main() {
  const isLive = process.argv.includes('--live');
  const dataset = loadDataset();


  const contextMetrics = computeContextMetrics(dataset);
  const hallucinationMetrics = isLive ? await computeHallucinationMetric(dataset) : null;


  printReport(contextMetrics, hallucinationMetrics);


  const failures = [];
  if (contextMetrics.avgRecall < THRESHOLDS.recallAt5) failures.push('Context Recall@5 below threshold');
  if (contextMetrics.precisionAt1Rate < THRESHOLDS.precisionAt1) failures.push('Context Precision@1 below threshold');
  if (hallucinationMetrics && hallucinationMetrics.groundedRate < THRESHOLDS.groundedRate) {
    failures.push('Groundedness below threshold');
  }


  if (failures.length > 0) {
    console.log('❌ FAILED:', failures.join('; '));
    process.exit(1);
  }


  console.log('✅ All metrics within threshold');
  process.exit(0);
}


main().catch(err => {
  console.error('❌ Error running DeepEval metrics:', err.message);
  process.exit(2);
});