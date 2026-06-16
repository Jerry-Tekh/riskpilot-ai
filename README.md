# RiskPilot AI

**🔗 Live demo:** https://riskpilotai.vercel.app · **API:** https://riskpilot-ai-production.up.railway.app/api/health


> The autonomous trading agent that decides **whether a trade should happen at all** — and is the only one that says *no*.

Built for the **Bitget AI Base Camp Hackathon S1 — Track 1 (Trading Agent)**.

Most trading agents chase profit. RiskPilot evaluates **trade quality and risk** before execution, sizes positions to risk, sets stops/targets, and **rejects** trades that fail its guardrails. It runs the complete Bitget judging loop end to end:

**Perception → Decision → Execution → Risk Management**

---

## Why it stands out

- **A risk-first agent that can reject trades.** Seven explicit veto rules (score floor, poor reward:risk, extreme volatility, drawdown breach, concentration, crowded funding, news blackout) — every verdict is auditable, not vibes.
- **Deterministic decision engine + Qwen narration.** The score, verdict, sizing, and SL/TP are computed by pure, reproducible functions. Qwen 3.6 only *explains* the verdict in natural language — it never changes it. That makes backtests meaningful and the agent impossible to talk into a bad trade.
- **Deep Analysis (on demand).** One click runs Qwen with full chain-of-thought reasoning to produce a structured market deep-dive (Market Read · Signal Breakdown · Risk Assessment · Verdict Rationale) — without slowing the core loop.
- **Real technical analysis.** RSI, MACD, and SMA-cross are computed from live Bitget candle data, so perception is genuinely analyst-grade, not mocked.
- **Provable autonomy.** A background risk monitor watches open positions on an interval and auto-closes them at stop-loss / take-profit **with no human in the loop** — visible in the trade log as `source: monitor`.
- **Never breaks in a demo.** Every external call (Bitget Skills, Agent Hub, Qwen) goes through a live-first adapter with a cached fallback, so the loop always completes even if a service is down.
- **Verifiable evidence on first load.** A seed script runs the *real* engine over 90 days of market data to produce a full track record (PnL, win rate, Sharpe, max drawdown) — which doubles as the backtest deliverable.

---

## The Agent Loop

| Stage | What happens | Where |
|---|---|---|
| **Perception** | Pulls trend, momentum, volatility, sentiment, funding, news into a structured `MarketContext` | `adapters/skillHub.js` → `orchestrator.buildContext` |
| **Decision** | Deterministic weighted model produces Trade Score, Direction, Confidence | `engines/scoring.js` |
| **Execution** | Approved trades open a simulated position; rejections are logged as evidence | `adapters/agentHub.js` + `engines/simBroker.js` |
| **Risk Management** | SL/TP, position sizing, 7 veto rules → APPROVE / MODIFY / REJECT; background monitor auto-closes | `engines/risk.js` + `monitor.js` |

---

## Architecture

```
React + Vite SPA (web/)
  Agent Console · Market Intel · Risk Center · Trade Log
        │ Axios REST
Express API (server/)
  Orchestrator: perceive → decide → execute → risk
  Adapters (live-first, cached fallback): SkillHub · AgentHub · Qwen
  Pure engines (unit-tested, no network): scoring · risk · simBroker
  Background risk monitor (interval, autonomous close)
        │ Prisma
PostgreSQL
```

**Bitget modules used:** Skill Hub (technical / sentiment / market-intel / news perception), Agent Hub (simulated order execution), Qwen 3.6 Plus (reasoning narration via `https://hackathon.bitgetops.com/v1`).

---

## Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS Modules-style theming, React Router, Axios, Recharts
- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Tests:** Vitest (29 tests across engines, adapters, orchestrator, monitor, stats, API)
- **AI:** Qwen 3.6 Plus (narration only)

---

## Local Setup

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL running locally (or a hosted Postgres URL)

### 1. Database
Create a database and user, e.g.:
```bash
sudo -u postgres psql -c "CREATE ROLE riskpilot LOGIN PASSWORD 'riskpilot' CREATEDB;" \
  -c "CREATE DATABASE riskpilot OWNER riskpilot;"
```

### 2. Backend
```bash
cd server
cp .env.example .env          # set DATABASE_URL; QWEN_API_KEY optional (template fallback works without it)
npm install
npx prisma migrate dev --name init
npm run seed                  # generates 90 days of simulated trading evidence
npm run dev                   # API on http://localhost:4000
```

`.env` essentials:
```
DATABASE_URL="postgresql://riskpilot:riskpilot@localhost:5432/riskpilot?schema=public"
PORT=4000
QWEN_API_KEY=""               # optional — leave empty to use deterministic template narration
QWEN_BASE_URL="https://hackathon.bitgetops.com/v1"
QWEN_MODEL="qwen3.6-plus"
MONITOR_INTERVAL_MS=30000
```

### 3. Frontend
```bash
cd web
echo 'VITE_API_URL=http://localhost:4000' > .env
npm install
npm run dev                   # app on http://localhost:5173
```

### 4. Tests
```bash
cd server && npm test
```

---

## Demo Script (≤3 min)

1. **Trade Log** — open already rich with 90 days of seeded history (instant credibility): ~200 trades, 54 rejections, equity curve, Sharpe, drawdown.
2. **Agent Console** — type `Trade BTC using current conditions` → the four loop steps light up → **APPROVE** (green), a position opens with SL/TP and risk-based size.
3. **Agent Console** — type `Trade ETH` → **MODIFY** (amber): *"It still trades, but cuts the size because the book is already concentrated."*
4. **Agent Console** — type `Trade DOGE` → verdict card flips to **REJECT** (red) with veto reasons (extreme volatility, crowded funding). *"It just refused a trade — that's the difference."*
5. **Risk Center** — exposure caps, drawdown guard, risk score — all coherent (never over-leveraged).
6. **Trade Log** — point to a `monitor` row: *"The agent closed this at its stop while no one was watching. No human in the loop."*
7. **Stats header** — win rate, Sharpe, # rejected. *Verifiable evidence, runnable now.*

> The three-tier verdict — **APPROVE → MODIFY → REJECT** — is the whole story: an agent that doesn't just buy, but decides *how much* or *whether at all*.

---

## Verifiable Evidence

- **Simulated trade log** — every OPEN/CLOSE with reason and source (`agent` vs autonomous `monitor`)
- **Decision log** — every verdict including rejections, with the veto reasons and full market context
- **Performance** — equity curve, total PnL, win rate, Sharpe, max drawdown via `/api/stats`
- **Adapter transparency** — `live` vs `cached` data source shown in the UI

---

## Project Structure

```
riskpilot/
├── server/   Express API, engines, adapters, Prisma, seed
└── web/      React + Vite frontend (4 screens)
```

See `docs/DEPLOYMENT.md` for production deployment (Railway + Vercel).
