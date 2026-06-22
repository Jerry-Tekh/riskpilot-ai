# RiskPilot AI — Submission Materials

> Links to fill in:
> - **Demo:** https://riskpilotai.vercel.app
> - **GitHub:** https://github.com/Jerry-Tekh/riskpilot-ai
> - **Trade log (evidence):** https://github.com/Jerry-Tekh/riskpilot-ai/blob/master/docs/evidence/trade-log-sample.csv
> - **Bitget Playbook:** Published as **"RiskPilot Adaptive Regime"** (v0.0.1) — https://www.bitget.com/en/activity/ai-get-agent/playbook/f843acbc-92db-494d-9af5-1d71b4da95ff · publication + backtest record: [docs/evidence/playbook-backtest.md](evidence/playbook-backtest.md)
> - **Demo video:** _(add your Twitter/YouTube link)_

---

## Track 1 — Project Description (four-part structure)

**RiskPilot AI — the autonomous trading agent that decides whether a trade should happen at all.**

**1. Problem.** Autonomous agents that blindly execute signals blow up accounts. The hard part of trading isn't generating entries — it's judgment: position sizing, knowing when an edge is real, and having the discipline to *not* trade. Most "AI trading agents" are a thin wrapper that asks an LLM "buy or sell?", which is non-reproducible and can be talked into a bad trade.

**2. Solution & thesis (core logic).** The most reliable edge is *risk-adjusted selectivity*. RiskPilot separates *decision* from *narration*: a **deterministic engine** makes every call so verdicts are reproducible and auditable, while an LLM only explains them. Its strategy is **adaptive by regime** — trend-follow when trending, mean-revert when ranging, and **stay flat when the market is unclear** — and every candidate trade must survive **nine independent risk vetoes** (score floor, reward:risk, extreme volatility, drawdown breach, portfolio concentration, crowded funding, news blackout, low signal confidence, and an unconfirmed-short guard that refuses to short into strength or high volatility). The agent is defined by what it *refuses*.

**3. How it works (the loop).** *Perception* pulls live Bitget candle data, computes real RSI/MACD/SMA, and reads the live Fear & Greed index into a structured market context. *Decision* scores the trade deterministically (transparent, itemized waterfall). *Execution* opens a simulated position with risk-based sizing and ATR stop-loss/take-profit. *Risk management* runs continuously — a background monitor auto-closes positions at their stops with no human in the loop, and an **Autopilot** mode runs the whole loop across BTC/ETH/DOGE autonomously. Qwen 3.6 narrates each verdict (and a "Deep Analysis" mode runs full chain-of-thought on demand) but never changes it.

**4. My take on AI trading.** I think the industry has the agent thesis backwards. The race is to build agents that find *more* trades, faster — but autonomy without judgment just automates ruin. The thing only an AI agent can do truly well isn't predicting price; it's enforcing discipline without ego, fatigue, or FOMO — applying the exact same risk rules on the 1,000th trade as on the first, and being willing to do nothing. I built RiskPilot to prove that the most valuable autonomous trader is often the one that says *no* the most. As models get stronger, I believe the winning designs will keep the *decision* deterministic and auditable and use the LLM only to explain — because in finance, reproducibility and the ability to reject are worth more than raw predictive flair.

---

### Evidence & results (supporting the trading-log + backtest deliverables)

A 90-day backtest run by the *real* engine: 310 trade events, 58 risk-rejected decisions, autonomous stop-outs, **+9.97% return at 3.98% max drawdown**. The full trade log (timestamp, pair, direction, price, quantity, balance) is exportable as CSV and committed to the repo (`docs/evidence/trade-log-sample.csv`); the backtest code is open and reproducible (`server/prisma/seed.js`, `server/src/engines/`). The same risk-first thesis is also published as a **Bitget GetAgent Playbook** ("RiskPilot Adaptive Regime"), backtested on Bitget's own platform.

**Bitget modules used:** Bitget market-data API (live perception), Agent Hub (execution), Qwen 3.6 (reasoning), and GetAgent Playbook (published, platform-native backtest).

---

## Community Post (X / Telegram)

**Version A — short:**

> Built RiskPilot AI for #BitgetHackathon 🛡️
>
> Most trading agents chase profit. Mine asks a harder question: *should this trade happen at all?*
>
> Risk-first autonomous agent — adaptive by regime, 9 veto rules, autonomous stop-outs, fully auditable verdicts. Strategy also published as a Bitget GetAgent Playbook.
>
> Powered by @Bitget_AI · live on 👉 [demo link]

**Version B — thread (more reach):**

> 1/ Built RiskPilot AI for #BitgetHackathon — an autonomous trading agent with one obsession: risk. 🛡️
>
> Most agents ask "how do I make money?" RiskPilot asks "should I even take this trade?"
>
> 2/ The full loop, on live Bitget data:
> 🔍 Perception — real RSI/MACD + Fear & Greed
> 🧠 Decision — deterministic, reproducible scoring
> ⚡ Execution — sim orders, risk-based sizing
> 🛡️ Risk — 9 veto rules + autonomous stop-outs
>
> 3/ The signature move: it says NO. High volatility into crowded funding → REJECT, with the reason. It's adaptive by regime: trend-follow, mean-revert, or stay flat when unclear. Qwen 3.6 narrates but never overrides the engine.
>
> 4/ Engage Autopilot and it trades BTC/ETH/DOGE on its own — watch the live activity feed. No human in the loop.
>
> 5/ Proof: 90-day backtest, +9.97% at 3.98% max drawdown, 58 rejections, full CSV trade log on GitHub. Strategy also published on @Bitget_AI GetAgent Playbook.
>
> 👉 [demo link] [video link]

---

## Submission Checklist (Track 1 — per the latest rules)

- [ ] **Project description** — paste the four-part thesis above (explains core logic, not a feature list ✓)
- [ ] **GitHub repo** — public with complete README ✓ (https://github.com/Jerry-Tekh/riskpilot-ai)
- [ ] **Live/paper trading log** — `docs/evidence/trade-log-sample.csv` (timestamp, pair, direction, price, quantity, balance ✓) + live `/api/trades/export.csv`
- [ ] **Backtest report** — code is open (`server/prisma/seed.js`, `server/src/engines/`) + the published Bitget Playbook backtest
- [ ] **Demo link** — https://riskpilotai.vercel.app (public, no login)
- [ ] **Demo video** — optional (demo is public); recommended: post to Twitter, ≤3 min, follow `docs/DEMO_SCRIPT.md`
- [ ] **Bitget Playbook** — publish `playbook/riskpilot-adaptive-regime` (see `playbook/PUBLISH.md`) and add the link
- [ ] **Community post** — quote the official Bitget tweet, tag #BitgetHackathon + @Bitget_AI (Community Impact + Participation awards)

> Submission form: https://forms.gle/CEGB6fRtuobD3bCj8 — verify your **UID matches registration**, and ensure **every link is public (no login)**.
