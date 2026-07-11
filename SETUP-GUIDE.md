# GovMurshid — Setup Guide

> Follow this guide after cloning the repo to get everything installed, running, and verified from scratch.

---

## Prerequisites

### 1. Node.js (v20 or higher)
```bash
node -v
```
If missing or below v20:
```bash
brew install node
```

### 2. Git
```bash
git --version
```
If missing: `brew install git`

### 3. Ollama (local LLM — free, no API key needed)
Download from [ollama.com/download](https://ollama.com/download), install the Mac app, and launch it. You will see a llama icon appear in your menu bar.

Pull the model:
```bash
ollama pull llama3.2
```

Verify it works:
```bash
ollama run llama3.2 "Say hello in one sentence."
```

### 4. k6 (performance testing)
```bash
brew install k6
k6 version
```

### 5. Promptfoo (RAG evaluation)
```bash
npm install -g promptfoo
promptfoo --version
```

---

## Step 1 — Clone and install

```bash
git clone https://github.com/fayazbasha410/govassist-qa-pilot.git
cd govassist-qa-pilot
npm install
npx playwright install --with-deps chromium
```

---

## Step 2 — Start the server

Open Terminal Tab 1:
```bash
npm start
```

Expected output:
```
GovMurshid server running at http://localhost:3000
Health check: http://localhost:3000/api/health
```

Verify:
```bash
curl http://localhost:3000/api/health
```

Expected:
```json
{"status":"ok","version":"1.0.0","model":"llama3.2","name":"GovMurshid"}
```

---

## Step 3 — Open the app

```
http://localhost:3000
```

Try clicking the **"Driving license"** suggestion. You should see a grounded answer with a `📄 RAG: POL-001` tag confirming the retrieval layer is working.

---

## Step 4 — Verify everything works

Open Terminal Tab 2 (keep Tab 1 running). Run each check in order:

### Check 1 — Policy data
```bash
node -e "
const p = require('./src/data/policies');
console.log('Total policies:', p.length);
if (p.length < 35) { console.error('FAIL: Missing policies'); process.exit(1); }
console.log('PASS: All', p.length, 'policies loaded');
"
```
Expected: `PASS: All 35 policies loaded`

### Check 2 — Playwright tests
```bash
npx playwright test
```
Expected: `66 passed`

### Check 3 — Adversarial red team
```bash
npm run eval:redteam
```
Expected: `✅ ALL GUARDRAILS HOLDING — red team passed` and `20/20 correctly handled`

### Check 4 — RAG regression gate
```bash
npm run eval:regression
```
Expected: `✅ WITHIN NOISE BAND` or `✅ NO REGRESSION`

The eval uses llama3.2 as judge so results have some natural variance. A pass rate of 80%+ is healthy and within the noise band.

### Check 5 — Production eval simulation
```bash
npm run eval:prod
```
Expected: `Passed: 10/10 (100.0%)` or close to it.

### Check 6 — Performance load test
```bash
npm run perf
```
Expected (all 4 thresholds green):
```
Health p95 < 500ms:   ✅ PASS
Search p95 < 500ms:   ✅ PASS
Chat p95 < 30000ms:   ✅ PASS
Error rate < 5%:      ✅ PASS
```

### Check 7 — Observability dashboard
```bash
npm run eval:dashboard
```
Expected: Opens `eval/observability/dashboard.html` in your browser showing a quality trend chart.

---

## Deployment

GovMurshid runs fully locally — no cloud account or API key required. The LLM (llama3.2) runs via Ollama on your machine.

To deploy to a server:
1. Replace Ollama with an API-based LLM (Anthropic, OpenAI, Azure OpenAI)
2. Set the API key as an environment variable and update `callOllama()` in `src/server.js`
3. Deploy the Node.js server to any platform (Railway, Render, AWS, Azure)
4. Update `BASE_URL` in tests and eval configs via environment variables

---

## Troubleshooting

### "command not found: ollama"
Make sure the Ollama app is open (llama icon in menu bar), then:
```bash
export PATH=$PATH:/usr/local/bin
ollama pull llama3.2
```

### "LLM unavailable" from the server
Ollama must be running before `npm start`. Launch the Ollama app first, wait for the menu bar icon, then start the server.

### Playwright UI tests failing
Make sure `npm start` is running in Tab 1 before running `npx playwright test` in Tab 2.

### "Baseline not found" from regression gate
Check that `eval/baselines/baseline-v1.json` exists. If missing, run:
```bash
cd eval/configs && promptfoo eval --config promptfoo.yaml
```

### k6 not found
```bash
brew install k6
```

### promptfoo not found
```bash
npm install -g promptfoo
```

---

## npm Scripts Reference

| Script | What it does |
|---|---|
| `npm start` | Start the GovMurshid server on port 3000 |
| `npx playwright test` | Run all 66 UI and API tests |
| `npm run eval` | Run Promptfoo RAG eval (15 golden cases) |
| `npm run eval:regression` | Run regression gate vs baseline |
| `npm run eval:redteam` | Run 20-attack adversarial suite |
| `npm run eval:prod` | Run production traffic simulation |
| `npm run eval:dashboard` | Generate and open observability dashboard |
| `npm run eval:view` | Open Promptfoo visual report UI |
| `npm run perf` | Run k6 load test (50 seconds) |
