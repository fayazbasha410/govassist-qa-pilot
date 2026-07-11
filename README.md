# 🇦🇪 GovMurshid — UAE Government Services AI Assistant

GovMurshid is a UAE government services AI assistant built on a RAG + agentic architecture, covering all 7 emirates. It is wrapped in a full enterprise QA suite including LLM evaluation, adversarial red-teaming, performance testing, accessibility checks, and CI/CD automation.

> **Deployment:** The project currently runs locally. No cloud deployment is required — all components (LLM, server, tests, evals) run on your machine via Ollama. See `SETUP-GUIDE.md` to get started.

---

## 🏗️ What's Inside

### The Application
- **RAG layer** — answers policy questions grounded in 35 UAE government policy documents
- **Agentic layer** — executes tool calls (`checkFineStatus`, `bookAppointment`) via mock APIs
- **Guardrails** — blocks prompt injection, jailbreaks, and off-topic requests
- **Chat UI** — full web interface at `http://localhost:3000`

### UAE Coverage
All 7 emirates — Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah.

Service categories: Driving & Vehicles, Identity & Residency, Education, Healthcare, Housing, Business, Social Services, Utilities.

### The QA Suite

| Layer | Tool | Result |
|---|---|---|
| UI automation | Playwright + enterprise POM | 66 tests ✅ |
| API + schema validation | Playwright request + schema checks | 43 API tests ✅ |
| RAG / LLM evaluation | Promptfoo + LLM-as-judge | 15/15 golden dataset ✅ |
| Regression gating | Promptfoo + noise band gate | Proven detection ✅ |
| Adversarial red team | Custom attack suite | 20/20 attacks handled ✅ |
| Performance | k6 load test | p95 health 2ms, chat 7.6s @ 5 VUs ✅ |
| Accessibility | axe-core + Playwright | 9/9 WCAG 2.1 AA ✅ |
| CI/CD | GitHub Actions | PR + develop + nightly workflows ✅ |
| Observability | Prod eval simulator + HTML dashboard | 10/10 prod traffic ✅ |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install
npx playwright install --with-deps chromium

# 2. Start the server (keep this running in Tab 1)
npm start

# 3. Open the app
open http://localhost:3000
```

See `SETUP-GUIDE.md` for full installation steps including Ollama, k6, and Promptfoo.

---

## 📁 Project Structure

```
govassist-qa-pilot/
├── src/
│   ├── data/policies.js            # 35 UAE government policy documents
│   ├── tools/agentTools.js         # Mock agent tools (fines, appointments)
│   └── server.js                   # Express server — RAG + agent + guardrails
├── public/
│   └── index.html                  # Chat UI
├── tests/
│   ├── pages/                      # Page Object Model
│   │   ├── BasePage.js
│   │   ├── ChatPage.js
│   │   └── components/             # Header, MessageList, InputBar
│   ├── api/
│   │   └── GovAssistApiClient.js   # Centralised API client
│   ├── fixtures/fixtures.js        # Playwright fixtures
│   ├── helpers/testHelpers.js      # Shared utilities
│   ├── data/testData.js            # Centralised test data
│   └── specs/
│       ├── api/                    # health, policies, fines, appointments, chat
│       └── ui/                     # chat, accessibility
├── eval/
│   ├── golden-dataset/             # Versioned golden dataset (15 cases)
│   ├── configs/promptfoo.yaml      # Promptfoo RAG eval config
│   ├── baselines/baseline-v1.json  # Regression baseline
│   ├── regression-gate.js          # Noise-band regression gate
│   ├── adversarial/red-team.js     # 20-attack red team suite
│   ├── prod-simulator/prod-eval.js # Production traffic simulator
│   └── observability/              # Metrics store + HTML dashboard
├── tests/performance/
│   └── load-test.js                # k6 load test
└── .github/workflows/
    ├── pr-checks.yml               # Runs on every PR
    ├── develop-full-suite.yml      # Runs on develop merge
    └── nightly.yml                 # Nightly scheduled run
```

---

## 🛠️ npm Scripts

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

---

## 🌐 Deployment Note

GovMurshid is currently designed to run locally. The LLM (llama3.2) runs via Ollama on your machine — no external API keys or cloud costs required.

To deploy to a server or cloud environment, you would:
1. Replace Ollama with an API-based LLM (Anthropic, OpenAI, Azure OpenAI)
2. Set the API key as an environment variable and update `callOllama()` in `src/server.js`
3. Deploy the Node.js server to any cloud platform (Railway, Render, AWS, Azure)
4. Update `BASE_URL` in tests and eval configs via environment variables

---

## 🧠 Key Engineering Decisions

### Keyword + synonym retrieval instead of embeddings
For a pilot with 35 documents, keyword retrieval with synonym expansion is deterministic, debuggable, and fast. The architecture is designed to swap in a vector DB (Pinecone, pgvector) at the retrieval layer without changing the eval or test layers.

### Promptfoo for LLM evaluation
Promptfoo is JavaScript-native, supports LLM-as-judge, red-teaming, and regression comparison in a single tool. The eval methodology is tool-agnostic and can be replicated with Ragas or DeepEval.

### Noise-band regression gating
Per-case gating on 15 tests produces a 54% false-alarm rate (`1 - 0.95^15`). The noise-band approach gates on aggregate pass rate vs baseline within ±20%, keeping false alarms under 2% while catching real regressions.

### Production eval feedback loop
Offline test suites go stale without real user signal. The prod-eval simulator samples production-like traffic, scores it with the LLM judge, and flags failures as golden dataset candidates — closing the loop between production and CI.

---

## 🌿 Branch Structure

```
main        ← stable, production-ready code
develop     ← integration branch
feature/*   ← individual phase branches (all merged)
```
