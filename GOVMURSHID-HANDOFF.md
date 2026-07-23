# GovMurshid — Complete Project Roadmap Document

---

## 1. WHO YOU ARE

- **Name:** Fayaz Basha Shaik (GitHub: fayazbasha410)
- **Goal:** Built GovMurshid as a portfolio project for a Agentic QA Manager role in UAE
- **Machine:** Mac, Cursor editor

---

## 2. WHAT WAS BUILT — GOVMURSHID v3

**Live URL:** https://govmurshid.onrender.com/

**GitHub Repo:** https://github.com/fayazbasha410/govassist-qa-pilot

**What it is:** A UAE government services AI assistant (RAG + agentic chatbot) covering all 7 emirates, wrapped in a full enterprise QA suite.

### The Application
- **RAG layer** — answers policy questions grounded in 55 UAE government policy documents (all 7 emirates, English + Arabic)
- **Agentic layer** — Groq native function calling for `checkFineStatus` and `bookAppointment`
- **Multi-turn memory** — session-based conversation history with topic change detection
- **Guardrails** — blocks prompt injection, jailbreaks, off-topic requests (English + Arabic)
- **Arabic support** — detects Arabic input, translates query for RAG retrieval, responds in Arabic
- **Chat UI** — full web interface at https://govmurshid.onrender.com/
- **LLM:** Groq API (llama-3.1-8b-instant) — free tier

### UAE Coverage
- All 7 emirates: Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah
- 55 policy documents (was 35) across: Driving, Identity/Residency, Education, Healthcare, Housing, Business, Social Services, Utilities
- Policy IDs: POL-001 to POL-055
- Every policy has English + Arabic content

---

## 3. TECH STACK

| Component | Technology |
|---|---|
| Backend | Node.js + Express |
| LLM | Groq API (llama-3.1-8b-instant) — free tier |
| Tool Calling | Groq native function calling (replaced keyword regex) |
| RAG retrieval | Keyword + synonym expansion + emirate boost scoring |
| Memory | Session-based multi-turn with topic change detection |
| UI | Vanilla HTML/CSS/JS |
| UI Tests | Playwright with enterprise POM |
| API Tests | Playwright request context |
| LLM Eval | Promptfoo |
| Performance | k6 |
| Accessibility | axe-core + Playwright |
| CI/CD | GitHub Actions |
| Observability | Custom metrics store + HTML dashboard |
| Deployment | Render.com (free tier) |

---

## 4. PROJECT STRUCTURE

```
govassist-qa-pilot/
├── src/
│   ├── data/policies.js            # 55 UAE government policy documents (EN + AR)
│   ├── tools/agentTools.js         # Mock agent tools (fines, appointments)
│   └── server.js                   # Express server — RAG + agent + guardrails + memory + Arabic
├── public/
│   └── index.html                  # Chat UI (UAE flag, suggestion buttons, Arabic, footer)
├── tests/
│   ├── pages/                      # Page Object Model
│   │   ├── BasePage.js
│   │   ├── ChatPage.js
│   │   └── components/             # Header, MessageList, InputBar
│   ├── api/
│   │   └── GovAssistApiClient.js   # Centralised API client (with session support)
│   ├── fixtures/fixtures.js        # Playwright fixtures
│   ├── helpers/testHelpers.js      # Shared utilities + response time helpers
│   ├── data/
│   │   ├── testData.js             # Centralised test data (EN + AR, all 7 emirates)
│   │   ├── locale_en.json          # English expected strings (no hardcoding in specs)
│   │   └── locale_ar.json          # Arabic expected strings
│   └── specs/
│       ├── api/                    # health, policies, fines, appointments, chat
│       └── ui/                     # chat (EN + AR), accessibility
├── eval/
│   ├── golden-dataset/
│   │   └── uae-gov-services.json   # 20 golden cases (15 English + 5 Arabic)
│   ├── configs/
│   │   └── promptfoo.yaml          # 20 test cases, Groq judge, concurrency 1
│   ├── baselines/
│   │   └── baseline-v1.json        # baseline: 20 cases, 100% passRate, noiseBand 0.20
│   ├── regression-gate.js          # Noise-band regression gate
│   ├── adversarial/
│   │   └── red-team.js             # 30 attacks (English + Arabic)
│   ├── prod-simulator/
│   │   └── prod-eval.js            # 13 prod queries (8 English + 5 Arabic)
│   └── observability/
│       ├── metrics-store.js
│       ├── metrics-history.json
│       └── dashboard.js
├── tests/performance/
│   └── load-test.js                # k6 load test (3 VUs, 90s timeout)
├── .github/workflows/
│   ├── pr-checks.yml
│   ├── develop-full-suite.yml
│   └── nightly.yml
├── render.yaml
└── GOVMURSHID-HANDOFF.md
```

---

## 5. CONFIRMED TEST RESULTS (latest run — Tier 2 complete)

| Test Suite | Result |
|---|---|
| Playwright (UI + API) | **200/200 ✅** |
| Red team adversarial | **30/30 ✅** |
| RAG regression gate | **18/20 — 90%** within ±20% noise band ✅ |
| Production eval | **13/13 — 100%** (8 English + 5 Arabic) ✅ |
| k6 performance | **4/4 thresholds** @ 3 VUs ✅ |
| axe-core accessibility | **WCAG 2.1 AA** ✅ |

### Test breakdown (200 total)
| Spec | Tests | TC IDs |
|---|---|---|
| health.spec.js | 9 | TC_H_001–009 |
| policies.spec.js | 35 | TC_POL_001–035 |
| fines.spec.js | 15 | TC_FINE_001–015 |
| appointments.spec.js | 19 | TC_APPT_001–015 |
| chat.spec.js (API) | 82 | TC_CHAT_001–064 |
| chat.spec.js (UI) | 31 | TC_UI_001–031 |
| accessibility.spec.js | 9 | — |

---

## 6. KEY ARCHITECTURE DECISIONS

### Tool calling (Tier 2 — DONE)
- Uses Groq native function calling API
- Fast regex pre-check first — skips Groq API call for 99% of messages
- Only calls Groq for appointment booking (needs service name extraction)
- Fine check: regex extracts plate number directly (no LLM hallucination)
- Graceful fallback to RAG if tool detection fails

### Multi-turn memory (Tier 2 — DONE)
- Session-based `Map` — each session has `history`, `currentTopic`, `topicChanged`
- `SESSION_MAX_TURNS = 6` — sliding window keeps last 6 turns
- Topic stored separately from history — survives history trimming
- Topic groups: driving, school, insurance, visa, housing, business, social
- Topic change detected by comparing incoming topic group vs stored topic
- Follow-up enrichment uses first topic message in history (not last)
- Fallback enrichment uses topic group keywords when history is all follow-ups
- Sessions auto-expire after 30 minutes

### RAG retrieval
- Keyword + synonym expansion (no vector DB)
- Emirate boost: +5 score for exact emirate match, +1 for All UAE
- topK = 5 (was 3) to surface emirate-specific policies
- Arabic queries translated to English keywords before retrieval
- Context includes emirate name in policy header for LLM disambiguation

### Policies (55 total)
- POL-001 to POL-035: original All UAE, Abu Dhabi, Dubai policies
- POL-036 to POL-055: new Sharjah, Ajman, UAQ, RAK, Fujairah policies
- Every policy has English content + Arabic translation
- Sourced from official UAE portals: MOI, u.ae, DHA, ADEK, KHDA, SEDD, etc.

### Test architecture
- No hardcoded strings in spec files
- All expected values in `locale_en.json` and `locale_ar.json`
- All test data in `testData.js`
- TC IDs on every test (TC_H, TC_POL, TC_FINE, TC_APPT, TC_CHAT, TC_UI)
- Response time assertions with `measureTime()` helper
- Memory and topic change tested via session IDs

---

## 7. ENVIRONMENT SETUP

```bash
# Clone
git clone https://github.com/fayazbasha410/govassist-qa-pilot.git
cd govassist-qa-pilot

# Install
npm install
npx playwright install --with-deps chromium
npm install -g promptfoo
brew install k6

# Environment
echo "GROQ_API_KEY=your_key_here" > .env

# Run locally
npm start
# Open http://localhost:3000
```

### npm Scripts
```bash
npm start                  # Start server on port 3000
npx playwright test        # Run 200 tests
npm run eval               # Promptfoo RAG eval (20 cases)
npm run eval:regression    # Regression gate
npm run eval:redteam       # 30-attack red team
npm run eval:prod          # 13 prod queries (English + Arabic)
npm run eval:dashboard     # Generate observability dashboard
npm run perf               # k6 load test
```

---

## 8. BRANCH STRATEGY

```
main        ← stable, deployed to Render.com
develop     ← integration branch
feature/*   ← individual feature branches
```

**Completed phases merged to main:**
- Phase 1-8: Full QA suite
- Foundation cleanup: Enterprise POM, UAE-wide expansion
- Tier 1: Groq API + Arabic support
- feature/groq-native-tool-calling ✅
- feature/multi-turn-memory ✅ (includes 55 policies + 200 tests)

---

## 9. WHAT'S NEXT — REMAINING ROADMAP

### 🔴 Tier 2 Remaining

**LangSmith Free Tier Integration** — BLOCKED
- Got 403 Forbidden on API key — account activation issue
- Try again: log out of smith.langchain.com, log back in, verify email, create new key
- Once working: 3 lines of code in server.js

### 🟡 Tier 3 — This Month

**Confidence Scoring**
- Show user how confident GovMurshid is
- "High confidence — sourced from POL-018" vs "Low confidence — please verify"
- Half a day

**Voice Input (Arabic + English)**
- Web Speech API — browser native, zero cost
- User speaks → text → GovMurshid answers
- Huge accessibility win for UAE audience
- 1 day

**WhatsApp / Telegram Bot**
- UAE residents live on WhatsApp
- Same backend, new channel
- Twilio WhatsApp sandbox is free for testing

**Real UAE Policy Data Pipeline**
- Currently 55 manually written policies
- Scrape/curate from official UAE portals (TAMM, Dubai Now, ICA, MOHRE)
- Auto-refresh pipeline when policies change

### 🟢 Tier 4 — Future

**LangChain RAG Pipeline** — replace keyword retrieval with vector embeddings
**LangGraph Agent** — replace linear pipeline with proper agent graph
**UAE PASS Simulation Layer** — simulate national digital identity login
**Real-time Policy Change Detection** — monitor UAE gov portals for changes
**Analytics Dashboard** — which questions get asked most, which fail most

---

## 10. KNOWN ISSUES / LIMITATIONS

1. **Groq free tier rate limit:** 6000 TPM. Tests use 1 worker. k6 uses 3 VUs max with 90s timeout.

2. **Render free tier sleeps:** After 15 mins of inactivity. First request after sleep takes ~30s.

3. **LangSmith:** 403 error on API key — account activation issue. Skip for now.

4. **VPN latency:** Groq responses take 30-60s on VPN. playwright.config.js timeout set to 120s.

5. **RAG is keyword-based:** Arabic retrieval relies on translation map. Missing translations cause retrieval failures. Tier 3 LangChain upgrade will fix.

6. **Tool detection:** Fine check uses regex (reliable). Appointment booking uses Groq (needs service name). If Groq fails, falls through to RAG gracefully.

---

## 11. IMPORTANT FILES TO KNOW

### `src/server.js` (v3.3.0)
- `TOPIC_GROUPS` — defines topic categories for memory management
- `detectTopicGroup()` — classifies message into topic category
- `getSession()` / `addToHistory()` / `clearSession()` — session management
- `retrieveRelevantDocs()` — RAG with emirate boost scoring, topK=5
- `fastToolPreCheck()` — regex pre-check before Groq tool detection
- `detectToolIntentWithLLM()` — Groq function calling for appointments only
- `callOllama()` — Groq LLM call with history injection
- `ACTIVE_SYSTEM_PROMPT` — emphasises emirate-specific policy priority

### `tests/data/locale_en.json` + `locale_ar.json`
- All expected strings for test assertions
- Policy IDs mapped by name
- Response time thresholds
- No hardcoded strings in spec files

### `tests/data/testData.js`
- All test inputs: plates, appointments, policy queries, chat messages, guardrail inputs
- Covers all 7 emirates in English and Arabic
- Edge cases: SQL injection, HTML injection, special chars, very long messages

---