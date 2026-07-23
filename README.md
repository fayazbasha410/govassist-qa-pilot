# GovMurshid — UAE Government Services AI Assistant

GovMurshid is a UAE government services AI assistant covering all 7 emirates. It is built on RAG + agentic architecture and wrapped in a full enterprise QA suite.

**Live:** https://govmurshid.onrender.com
**Repo:** https://github.com/fayazbasha410/govassist-qa-pilot

---

## What it does

- Answers UAE government service questions grounded in 55 policy documents
- Executes tool calls for traffic fine checks and appointment booking
- Supports English and Arabic — detection, retrieval, and responses
- Blocks prompt injection, jailbreaks, and off-topic requests
- Remembers conversation context across multiple turns per session

### Emirates covered

Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah

### Service categories

Driving, Identity and Residency, Education, Healthcare, Housing, Business, Social Services, Utilities

---

## QA Suite

| Layer | Tool | Result |
|---|---|---|
| API and UI automation | Playwright + POM | 200 tests |
| LLM evaluation | Promptfoo + LLM-as-judge | 20 golden cases |
| Regression gating | Noise band gate | 18/20 within band |
| Adversarial red team | Custom attack suite | 30/30 handled |
| Performance | k6 | 4/4 thresholds at 3 VUs |
| Accessibility | axe-core | WCAG 2.1 AA |
| CI/CD | GitHub Actions | PR + develop + nightly |
| Observability | Prod eval + dashboard | 13/13 prod traffic |

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
| `npx playwright test` | Run all 200 tests |
| `npm run eval:regression` | Run regression gate |
| `npm run eval:redteam` | Run 30-attack red team |
| `npm run eval:prod` | Run production eval |
| `npm run eval:dashboard` | Generate observability dashboard |
| `npm run perf` | Run k6 load test |

---

## Project structure

```
src/
  data/policies.js          55 UAE policy documents (EN + AR)
  tools/agentTools.js       Mock tools: fines and appointments
  server.js                 Server: RAG, tools, memory, guardrails, Arabic

public/
  index.html                Chat UI

tests/
  pages/                    Page Object Model (BasePage, ChatPage, components)
  api/GovAssistApiClient.js API client with session support
  data/testData.js          All test inputs: EN + AR, all 7 emirates
  data/locale_en.json       Expected English strings for assertions
  data/locale_ar.json       Expected Arabic strings for assertions
  helpers/testHelpers.js    Schema validators and response time helpers
  specs/api/                health, policies, fines, appointments, chat
  specs/ui/                 chat, accessibility

eval/
  golden-dataset/           20 versioned golden cases
  configs/promptfoo.yaml    Promptfoo eval config
  baselines/                Regression baseline
  adversarial/red-team.js   30-attack suite
  prod-simulator/           Production traffic simulator
  observability/            Metrics store and dashboard

tests/performance/
  load-test.js              k6 load test (3 VUs)

.github/workflows/
  pr-checks.yml
  develop-full-suite.yml
  nightly.yml
```

---

## Key decisions

**Keyword retrieval over embeddings** — 55 documents is small enough that keyword + synonym expansion with emirate boost scoring works well and is fully deterministic and debuggable. The retrieval layer can be swapped for a vector DB without touching the eval or test layers.

**Noise band regression gating** — per-case gating on 20 tests produces a high false-alarm rate. The gate checks aggregate pass rate vs baseline within a 20% noise band instead.

**Fast pre-check before tool detection** — a regex pre-check runs before any Groq API call. Most messages are plain questions and skip tool detection entirely. Only messages with a plate number and fine keyword, or a booking keyword and date, proceed to Groq.

**Topic-aware memory** — session history is trimmed to 6 turns but the current topic is stored separately so topic change detection still works after the original message is trimmed out.

---

## Branch structure

```
main      stable, deployed to Render
develop   integration branch
feature/* individual feature branches
```