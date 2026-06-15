# RiskPilot AI — Design Spec

**Date:** 2026-06-13
**Author:** Solo developer (with Claude)
**Target:** Bitget AI Base Camp Hackathon S1 — **Track 1 (Trading Agent)**
**Deadline context:** Submission window Jun 15–25, 2026 (~12 working days). 1st place judged across all tracks (6,600 USDT).

---

## 1. One-line pitch

> *"Every other agent asks 'how do I make money?' RiskPilot asks 'should this trade happen at all?' — and it's the only one that says no."*

RiskPilot AI is an autonomous trading copilot that evaluates **trade quality and risk** before execution and can **reject** poor trades. It demonstrates the full Bitget judging loop — **Perception → Decision → Execution → Risk Management** — end to end, with verifiable simulated-trading evidence.

## 2. Why this wins Track 1

- Track 1 requires a **runnable public demo link + <200-word description + optional video**. No public repo required (that's Track 2). Judging is about the *experience and the loop*, not code review.
- Explicit judging bar: *complete strategy loop validated through backtest or sim trading* + hard baseline of *verifiable usage evidence (sim trade logs, API call volume, or user count)*.
- Guide says: ***"Prioritize the autonomous trading loop over dashboard complexity."***
- **Differentiation wedge:** most entrants build a "buy-the-dip" bot. RiskPilot is the **risk-first agent that can say NO** — rare, judge-friendly, and memorable.

## 3. Key design decisions (locked)

| Decision | Choice | Why |
|---|---|---|
| Integrations | **Adapter + live-first, cached fallback** | Demo can never break mid-judging; cache doubles as seed/backtest data |
| Decision engine | **Deterministic engine + Qwen narration** | Reproducible, auditable, no hallucinated verdicts; meaningful backtests |
| Autonomy | **On-demand loop + background risk monitor** | Interactive demo + provable "no human in the loop" autonomy |
| Evidence | **Backtest-as-seed via real engine** | App arrives pre-populated with credible, reconciling history; satisfies backtest deliverable |
| Hosting | **Vercel/Netlify (web) + Railway/Render (API+Postgres)** | One public URL, free, solo-dev friendly |
| Stack | React+Vite+JS+CSS Modules+Recharts / Node+Express / Postgres+Prisma / Qwen 3.6 Plus | Solo-dev simplicity over enterprise ceremony |

## 4. Architecture

```
React + Vite SPA (Vercel/Netlify)
  Agent Console · Market Intel · Risk Center · Trade Log
        │ Axios (REST)
Express API (Railway/Render)
  ┌ Agent Loop Orchestrator: Perception → Decision → Execution → Risk ┐
  Adapter layer (live-first, cached fallback):
    • SkillHub adapter (technical / sentiment / market-intel / news)
    • AgentHub adapter (sim order execution)
    • Qwen adapter     (reasoning narration)
  Core engines (pure JS, deterministic, unit-tested):
    • Scoring engine (Trade Score, Confidence)
    • Risk engine    (SL/TP, size, 7 veto rules)
    • Sim broker     (fills, PnL, positions)
  Background Risk Monitor (interval job)
        │ Prisma
PostgreSQL
```

**Defensibility principle:** core engines are pure deterministic JS with **no network dependency**. Adapters (which can fail) feed them data; engines always produce a verdict; Qwen only *narrates*. The loop physically cannot break — worst case it runs on cached data with templated narration, but a full verdict + reasoning always comes out.

**Repo layout:** new `riskpilot/` directory with `riskpilot/server` (Express) and `riskpilot/web` (Vite). Fresh git repo initialized in `riskpilot/`.

## 5. The Agent Loop

### 5.1 Perception → `MarketContext`
Orchestrator calls four SkillHub adapters, normalizes each signal to a numeric sub-score (0–100) **and** a human label.

```
MarketContext {
  symbol: "BTCUSDT"
  trend:      { label: "Bullish",  score: 78 }   // technical-analysis
  momentum:   { label: "Strong",   score: 71 }   // technical-analysis
  volatility: { label: "High",     score: 82 }   // ATR / realized vol
  sentiment:  { label: "Neutral",  score: 52 }   // sentiment-analyst (F&G, L/S)
  funding:    { label: "Elevated", score: 38 }   // funding rate (high=crowded=penalty)
  newsImpact: { label: "Medium",   score: 60, headlines: [...] } // news-briefing
  dataSource: "live" | "cached"
  timestamp
}
```

### 5.2 Decision → Scoring Engine (pure, deterministic)
Transparent weighted model; **weights live in one config file** (auditable, tunable).

```
TradeScore = w1·trendAlignment + w2·momentum + w3·sentimentAlign
           − w4·volatilityPenalty − w5·fundingCrowdedness − w6·newsRisk
```
- **Direction** (Buy/Sell/Hold): trend + momentum sign vs. user intent.
- **Trade Score** (0–100): weighted sum.
- **Confidence** (Low/Med/High): signal agreement (low dispersion → high confidence).
- Same context → same score (reproducible backtests).

### 5.3 Risk Engine (pure, deterministic) — the differentiator
Runs after scoring; holds **veto power**.

```
RiskAssessment {
  riskLevel: Low | Medium | High | Extreme
  stopLoss / takeProfit: ATR-based (wider when vol high)
  maxPositionSize:       fixed-fractional / Kelly-lite, shrinks as risk rises
  rewardRiskRatio:       (TP−entry)/(entry−SL)
  vetoes: [ ... ]
}
```

**Veto rules (7):**
| Rule | Triggers when | Verdict |
|---|---|---|
| Score floor | TradeScore < 50 | REJECT |
| Poor R:R | reward:risk < 1.5 | REJECT |
| Extreme volatility | vol score > 90 | REJECT |
| Portfolio concentration | symbol exposure > cap | MODIFY (cut size) |
| Total drawdown breach | account drawdown > threshold | REJECT all new |
| Crowded funding + weak trend | funding extreme & trend weak | MODIFY / REJECT |
| **News blackout** | high-impact scheduled event imminent | REJECT / HOLD |

→ Final verdict: **APPROVE · MODIFY · REJECT**, always with machine-generated reasons.

### 5.4 Execution → Sim Broker
APPROVE/MODIFY: AgentHub adapter logs sim order; Sim Broker opens position (entry, size, SL, TP), persists. REJECT: nothing opens, but decision is logged (rejections = proof of judgment).

### 5.5 Risk Management → Background Monitor
Interval job (~30–60s): pulls latest price (live/cached) per open position, checks SL/TP/trailing/drawdown, **auto-closes/reduces**, writes trade log with reason (e.g. `auto-closed: stop-loss hit`). No human in loop = provable autonomy.

### 5.6 Qwen (narration only)
Receives finished `MarketContext` + `TradeScore` + `RiskAssessment`, writes human explanation. If Qwen down → template renders same facts. **Qwen never changes the verdict.** Runtime key in gitignored `.env` as `QWEN_API_KEY`; base URL `https://hackathon.bitgetops.com/v1`, model `qwen3.6-plus`.

## 6. Data model (Prisma / PostgreSQL)

```
MarketSnapshot   id, symbol, payload(json), source(live|cached), createdAt
Decision         id, symbol, intent, direction, tradeScore, confidence,
                 riskLevel, verdict(APPROVE|MODIFY|REJECT), vetoes(json),
                 reasoning(text), marketContext(json), createdAt
Position         id, decisionId, symbol, side, entryPrice, size,
                 stopLoss, takeProfit, status(OPEN|CLOSED),
                 exitPrice, exitReason, pnl, openedAt, closedAt
Trade            id, positionId, action(OPEN|CLOSE|REDUCE), price, size,
                 reason, source(agent|monitor), createdAt
PortfolioSnapshot id, equity, exposure, openPositions, drawdown, riskScore, createdAt
```
`Decision.marketContext` stores full JSON so every verdict is reconstructable.

## 7. REST API (Express)

```
POST /api/agent/analyze   { symbol }   → MarketContext + Decision (no execution)
POST /api/agent/run       { command }  → FULL LOOP, returns everything   ← star endpoint
GET  /api/market/:symbol               → latest MarketContext
GET  /api/positions?status=open|closed → positions
GET  /api/trades                       → trade log (paginated)
GET  /api/portfolio/summary            → equity, exposure, riskScore, drawdown
GET  /api/portfolio/history            → time series for charts
GET  /api/decisions                    → decision history (incl. rejections)
GET  /api/stats                        → win rate, Sharpe, max DD, total PnL, # rejected
GET  /api/health                       → adapter status (live/cached per service)
```
Background monitor = `setInterval` in the Express process (no separate worker infra).

## 8. Frontend (4 screens)

**Visual language:** dark trading-terminal aesthetic, **sharp square corners throughout (no border-radius)**, monospace numbers, green/red long-short & PnL, loud amber/red REJECTED treatment. Recharts everywhere. Bloomberg-terminal feel, not generic SaaS.

1. **Agent Console (star):** command input → 4 loop steps light up sequentially (staged reveal, polling or SSE) → Market Context panel + Verdict card. REJECT flips card to amber/red with veto reasons. Seed a command that reliably rejects.
2. **Market Intelligence:** full MarketContext — gauges per signal, sentiment over time, news feed, live/cached badge. Read-only.
3. **Risk Center (differentiator):** portfolio Risk Score + gauge, exposure-by-symbol bars + concentration warnings, drawdown curve, active risk alerts, open positions with SL/TP distance.
4. **Trade Log / Evidence:** stats header (Total PnL · Win Rate · Sharpe · Max DD · Trades · # Rejected), equity curve (seed/backtest data), filterable table of Decisions + Trades incl. `source: monitor` (autonomous closes) and REJECT rows.

## 9. 3-minute demo script

1. **0:00** Hook + Trade Log already rich with seeded history.
2. **0:30** Console: "Trade BTC using current conditions" → 4 steps light → APPROVE, position opens.
3. **1:15** Rigged command → REJECT card + veto reasons. "It just refused a trade."
4. **1:50** Risk Center: exposure caps + drawdown guard.
5. **2:20** Trade Log: a `monitor` auto-close row. "Closed at stop while no one watched."
6. **2:45** Stats header → win rate, Sharpe, # rejected. End on live URL.

## 10. Build plan (staged; each stage independently runnable)

- **Stage 0 — Scaffold:** server + web, git init, `.env.example`, `.gitignore`, health endpoint. **Deploy skeleton day 1.**
- **Stage 1 — Core engines (TDD):** scoring, risk (7 vetoes), sim broker. Unit-tested, no network. Lock first.
- **Stage 2 — Adapters + cached fallback:** SkillHub, AgentHub, Qwen behind uniform interface; live→cache fallback; record fixtures.
- **Stage 3 — Orchestrator + API:** wire loop into `/api/agent/run` + endpoints.
- **Stage 4 — Background monitor:** interval job, auto-close/reduce, evidence rows.
- **Stage 5 — Backtest-as-seed:** real engine over historical/cached data → 60–90 days history + equity curve + stats. Doubles as backtest deliverable.
- **Stage 6 — Frontend:** 4 screens, Recharts, sharp-corner theme, staged loop reveal.
- **Stage 7 — Polish + deploy + docs:** README, deployment guide, demo script, video, final deploy + smoke test.

## 11. Testing

- **Unit (priority):** every veto fires on right input, not on wrong; reproducibility (same context → same score).
- **Integration:** adapter fallback (network killed → cached completes loop); `/api/agent/run` end-to-end.
- **Smoke:** seed runs clean; stats reconcile (PnL ↔ win rate ↔ drawdown); public URL loads + loop runs on deployed instance.

## 12. Risk mitigation

| Threat | Mitigation |
|---|---|
| External service down during judging | Cached fallback — loop always completes |
| Qwen key/endpoint fails | Template narration fallback |
| Empty app on first click | Backtest-as-seed pre-populates everything |
| Last-minute deploy failure | Deploy skeleton day 1, deploy continuously |
| Numbers don't reconcile | Single source of truth = Sim broker; stats derived |
| Scope creep | Stages 0–5 = winning core; 6–7 polish. Loop + evidence stand even if time runs short |

## 13. Out of scope (YAGNI)

Real capital/live orders, auth/multi-user, multiple exchanges, Bitget Playbook live deploy (use our backtest; Playbook only as time-permitting bonus), websockets beyond polling, mobile-native layout (desktop-responsive first).

## 14. Mandatory deliverables mapping

| Required | Provided by |
|---|---|
| Runnable demo | Deployed public URL (Vercel + Railway) |
| Simulated trading history | Backtest-as-seed + live loop |
| Trade logs | Trade Log screen + `/api/trades` |
| Risk management evidence | Risk Center + veto/monitor logs |
| Backtesting results | Seed script output + stats header |
| README | Stage 7 |
| Deployment guide | Stage 7 |
