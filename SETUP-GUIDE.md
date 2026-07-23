# GovMurshid — Setup Guide

Follow this guide after cloning to get everything running from scratch.

**Live URL:** https://govmurshid.onrender.com (auto-deploys from main)

---

## Prerequisites

**Node.js v20+**
```bash
node -v
# if missing: brew install node
```

**Git**
```bash
git --version
# if missing: brew install git
```

**Groq API key** (free)
Sign up at https://console.groq.com, create an API key, keep it ready.

**k6**
```bash
brew install k6
```

**Promptfoo**
```bash
npm install -g promptfoo
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

## Step 2 — Set up environment

Create a `.env` file in the project root:
```
GROQ_API_KEY=your_groq_key_here
```

---

## Step 3 — Start the server

```bash
npm start
```

Expected output:
```
GovMurshid server running at http://localhost:3000
LLM: Groq API (llama-3.1-8b-instant)
Tool calling: fast pre-check + Groq native
Memory: multi-turn + topic change detection
Policies: 55 across all 7 emirates
Arabic support: enabled
```

Verify it is running:
```bash
curl http://localhost:3000/api/health
```

Expected:
```json
{"status":"ok","version":"3.3.0","name":"GovMurshid","policies":55}
```

---

## Step 4 — Open the app

```
http://localhost:3000
```

Click the Driving license suggestion. You should see a grounded answer with a RAG tag and the policy IDs that were retrieved.

---

## Step 5 — Run all checks

Keep the server running in one terminal. Open a second terminal for these:

**Playwright tests (200 tests)**
```bash
npx playwright test
```
Expected: 200 passed

**Red team**
```bash
npm run eval:redteam
```
Expected: 30/30 correctly handled

**Regression gate**
```bash
npm run eval:regression
```
Expected: WITHIN NOISE BAND (80% or above is healthy)

**Production eval**
```bash
npm run eval:prod
```
Expected: 13/13

**k6 load test**
```bash
npm run perf
```
Expected: 4/4 thresholds passing

**Observability dashboard**
```bash
npm run eval:dashboard
```
Opens dashboard.html in your browser.

---

## Deployment

The app is deployed on Render.com at https://govmurshid.onrender.com.

It auto-deploys when you push to main. The GROQ_API_KEY is set as an environment variable in the Render dashboard.

Note: the free tier spins down after 15 minutes of inactivity. The first request after sleep takes about 30 seconds.

To deploy your own instance:
1. Fork the repo
2. Create a new Web Service on Render pointing to your fork
3. Set GROQ_API_KEY in Render environment variables
4. Push to main to trigger a deploy

---

## Troubleshooting

**Connection error from server**
Your Groq API key is invalid or missing. Check your .env file and verify the key at https://console.groq.com/keys.

**LangSmith 403 error**
If you see LANGSMITH_TRACING in your .env, set it to false. LangSmith is not required for the app to run.

**Playwright tests failing**
Make sure npm start is running in another terminal before running tests.

**Baseline not found from regression gate**
The file eval/baselines/baseline-v1.json should exist in the repo. If missing, run the promptfoo eval once to generate a new baseline.

**k6 not found**
```bash
brew install k6
```

**promptfoo not found**
```bash
npm install -g promptfoo
```

**Groq rate limit during tests**
The free tier allows 6000 tokens per minute. Tests run with 1 worker. If you hit rate limits, wait a minute and retry. playwright.config.js has a 120s timeout to handle this.

---

## Scripts reference

| Script | What it does |
|---|---|
| `npm start` | Start server on port 3000 |
| `npx playwright test` | Run all 200 tests |
| `npm run eval` | Promptfoo RAG eval (20 cases) |
| `npm run eval:regression` | Regression gate vs baseline |
| `npm run eval:redteam` | 30-attack adversarial suite |
| `npm run eval:prod` | Production traffic simulation |
| `npm run eval:dashboard` | Generate observability dashboard |
| `npm run perf` | k6 load test |