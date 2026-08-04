# GovMurshid — UAE Government Services AI Assistant

GovMurshid is a UAE government services AI assistant covering all 7 emirates — everything except transport (transport lives in the sister project, [Tawfeer](https://github.com/fayazbasha410/tawfeer-ai)). It is built on RAG + agentic architecture and wrapped in a full enterprise QA suite.

**Live:** https://govmurshid.onrender.com
**Repo:** https://github.com/fayazbasha410/govassist-qa-pilot

---

## What it does

- Answers UAE government service questions grounded in 58 policy documents
- Executes tool calls for appointment booking (Emirates ID, residency visa, health card); fine checks are handled by the sister project, Tawfeer — `checkFineStatus` here is a stub that redirects there
- Supports English and Arabic — detection, retrieval, and responses
- Blocks prompt injection, jailbreaks, and off-topic requests
- Remembers conversation context across multiple turns per session
- Every `/api/chat` response includes `outputGuardrail` (format validation, groundedness) and `trace` (retriever/LLM/tool spans) fields

### Emirates covered

Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah

### Service categories

Identity and Residency, Health Insurance, Education, Housing, Business, Social Services, Utilities, Golden Visa, MOI, MOHRE, Zakat, Telecom, Company Formation, TAMM, DLD/RERA

---

## QA Suite

| Layer | Tool | Result |
|---|---|---|
| Unit tests | Vitest | 123 tests across 7 files, zero Groq quota |
| API and UI automation | Playwright + POM | 177 tests |
| LLM evaluation | Promptfoo + LLM-as-judge | 28 golden cases, 33 Groq calls/run |
| Regression gating | Noise band gate | baseline pending reset — see Open Items |
| Adversarial red team | Custom attack suite | 30 attacks |
| Bias checking | Native, Groq-as-judge | 3 paired national/expat prompts — wiring verified, real scores pending |
| Conversational eval | Native, deterministic | 3 scripted conversations, zero Groq cost |
| Performance | k6 | see `tests/performance/load-test.js` |
| Accessibility | axe-core | WCAG 2.1 AA |
| CI/CD | GitHub Actions | 4-stage: feature→develop→qa→staging→main |
| Observability | Prod eval + dashboard | see `eval/prod-simulator/` |

> Test counts above are from direct source inspection (`grep`-counted `it`/`test` calls, including `test.each` expansion) — run `npm run test:unit` and `npx playwright test --list` yourself for the authoritative numbers before citing these externally.

---

## Quick start

```bash
npm install
npx playwright install --with-deps chromium
npm install -g promptfoo
brew install k6

# Add your Groq API key
echo "GROQ_API_KEY=your_key_here" > .env

npm start
# Open http://localhost:3000
```

---

## Scripts

| Script | What it does |
|---|---|
| `npm start` | Start server on port 3000 |
| `npx playwright test` | Run all 177 E2E tests |
| `npm run test:unit` | Run Vitest suite, zero Groq quota |
| `npm run eval` | Promptfoo, `--no-cache --max-concurrency 2`, 33 Groq calls |
| `npm run eval:regression` | Run regression gate (baseline currently stale — pending reset) |
| `npm run eval:redteam` | Run 30-attack red team |
| `npm run eval:prod` | Run production eval |
| `npm run eval:deepeval` | Context Precision/Recall — zero network |
| `npm run eval:deepeval:live` | + Hallucination Detection — needs live server |
| `npm run eval:bias` | Native bias check — needs live server + `GROQ_API_KEY` |
| `npm run eval:conversational` | Native conversational eval — needs live server, zero Groq judge cost |
| `npm run eval:perf-trend` | Latency history |
| `npm run perf` | Run k6 load test |

**⚠️ Groq quota discipline:** the free-tier daily TPD ceiling is 500,000 tokens. Running `npm run eval` multiple times same-day will exhaust it — prefer `npm run test:unit` / `npm run eval:deepeval` (both zero-network) for quick iteration.

---

## Project structure

```
src/
  data/policies.js          58 UAE policy documents (EN + AR)
  tools/agentTools.js       bookAppointment (ID/visa/health only), checkFineStatus (stub → Tawfeer)
  server.js                 Server: RAG, tools, memory, guardrails, Arabic, trace, toolCorrectness
  lib/
    textDetection.js        Topic/emirate/Arabic detection
    ragEngine.js             Retrieval + confidence scoring
    followUp.js               Follow-up detection/enrichment
    guardrails.js               Input guardrails
    sanitizer.js                  Output character sanitiser
    session.js                     Session store factory
    outputGuardrails.js            Format validation, reask, filter, hallucination guard
    arabicTranslation.js           Arabic query translation

public/
  index.html                Chat UI

tests/
  pages/                    Page Object Model (BasePage, ChatPage, components)
  api/GovAssistApiClient.js API client with session support
  data/testData.js          All test inputs: EN + AR, all 7 emirates
  unit/lib/                 Vitest suite — 123 tests across 7 files
  specs/api/                health, policies, fines (stub), appointments, chat
  specs/ui/                 chat, accessibility

eval/
  golden-dataset/           23 versioned golden cases
  configs/promptfoo.yaml    28 test cases, 33 Groq calls/run
  baselines/                Regression baseline (currently stale)
  adversarial/red-team.js   30-attack suite
  prod-simulator/           Production traffic simulator
  observability/            Metrics store and dashboard
  bias-check.js              Native BiasMetric equivalent
  conversational-eval.js     Native conversational eval (knowledge retention, turn relevancy)
  deepeval-metrics.js         Context Precision/Recall/Hallucination
  performance-benchmark.js    Latency history + noise-band gate

tests/performance/
  load-test.js              k6 load test

.github/workflows/
  pr-checks.yml                 feature → develop
  qa-checks.yml                 develop → qa
  develop-full-suite.yml        qa → staging
  deploy-staging-to-main.yml    staging → main
  nightly.yml                   manual full eval (workflow_dispatch only)
```

---

## Key decisions

**Keyword retrieval over embeddings** — 58 documents is small enough that keyword + synonym expansion with emirate boost scoring works well and is fully deterministic and debuggable. The retrieval layer can be swapped for a vector DB without touching the eval or test layers.

**Noise band regression gating** — per-case gating produces a high false-alarm rate. The gate checks aggregate pass rate vs baseline within a noise band instead.

**Fast pre-check before tool detection** — a regex pre-check runs before any Groq API call. Most messages are plain questions and skip tool detection entirely. Only messages with a plate number and fine keyword (routed to the Tawfeer-redirect stub), or a booking keyword and date, proceed to Groq.

**Topic-aware memory** — session history is trimmed to 6 turns but the current topic is stored separately so topic change detection still works after the original message is trimmed out. A real production bug here (v3.11.0) — the app briefly misread a first-turn message as a follow-up to itself — was found via the eval suite, fixed, and turned into a permanent regression test (`conversational-eval.js`'s `CONV-003`).

---

## Branch structure

```
main       stable, deployed to Render
staging    auto-deploys to Render + auto-promotes to main on push
qa         full Playwright + regression gate + red team, gates staging
develop    integration branch, smoke + guardrail checks, gates qa
feature/*  individual feature branches
fix/*      bug-fix branches
```

4-stage pipeline: `feature/* → develop → qa → staging → main`, gated by `pr-checks.yml`, `qa-checks.yml`, `develop-full-suite.yml`, and `deploy-staging-to-main.yml` respectively.