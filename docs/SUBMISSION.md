# RiskPilot AI — Submission Materials

> Links to fill in:
> - **Demo:** https://riskpilotai.vercel.app
> - **GitHub:** https://github.com/Jerry-Tekh/riskpilot-ai
> - **Trade log (evidence):** https://github.com/Jerry-Tekh/riskpilot-ai/blob/master/docs/evidence/trade-log-sample.csv
> - **Bitget Playbook:** Published as **"RiskPilot Adaptive Regime"** (strategy_id `071fcb14-fca9-4ab6-9491-e8e33128a287`, v0.0.1) on GetAgent Playbook — https://www.bitget.com/en/activity/ai-get-agent/playbook · publication + backtest record: [docs/evidence/playbook-backtest.md](evidence/playbook-backtest.md)
> - **Demo video:** _(add your Twitter/YouTube link)_

---

## Track 1 — Project Description (four-part thesis structure)

**RiskPilot AI — the autonomous trading agent that decides whether a trade should happen at all.**

**1. Problem.** Autonomous agents that blindly execute signals blow up accounts. The hard part of trading isn't generating entries — it's judgment: position sizing, knowing when an edge is real, and having the discipline to *not* trade. Most "AI trading agents" are a thin wrapper that asks an LLM "buy or sell?", which is non-reproducible and can be talked into a bad trade.

**2. Thesis (core logic).** The most reliable edge is *risk-adjusted selectivity*. RiskPilot separates *decision* from *narration*: a **deterministic engine** makes every call so verdicts are reproducible and auditable, while an LLM only explains them. Its strategy is **adaptive by regime** — trend-follow when trending, mean-revert when ranging, and **stay flat when the market is unclear** — and every candidate trade must survive **seven independent risk vetoes** (score floor, reward:risk, extreme volatility, drawdown breach, portfolio concentration, crowded funding, news blackout). The agent is defined by what it *refuses*.

**3. How it works (the loop).** *Perception* pulls live Bitget candle data, computes real RSI/MACD/SMA, and reads the live Fear & Greed index into a structured market context. *Decision* scores the trade deterministically (transparent, itemized waterfall). *Execution* opens a simulated position with risk-based sizing and ATR stop-loss/take-profit. *Risk management* runs continuously — a background monitor auto-closes positions at their stops with no human in the loop, and an **Autopilot** mode runs the whole loop across BTC/ETH/DOGE autonomously. Qwen 3.6 narrates each verdict (and a "Deep Analysis" mode runs full chain-of-thought on demand) but never changes it.

**4. Evidence.** A 90-day backtest run by the *real* engine: ~300 trade events, 54 risk-rejected decisions, autonomous stop-outs, **+8.94% return at 3.6% max drawdown**. The full trade log (timestamp, pair, direction, price, quantity, balance) is exportable as CSV and committed to the repo; the backtest code is open and reproducible. The same risk-first thesis is also published as a **Bitget GetAgent Playbook** ("RiskPilot Adaptive Regime"), backtested on Bitget's own platform.

**Bitget modules used:** Bitget market-data API (live perception), Agent Hub (execution), Qwen 3.6 (reasoning), and GetAgent Playbook (published, platform-native backtest).

---

## Community Post (X / Telegram)

**Version A — short:**

> Built RiskPilot AI for #BitgetHackathon 🛡️
>
> Most trading agents chase profit. Mine asks a harder question: *should this trade happen at all?*
>
> Risk-first autonomous agent — adaptive by regime, 7 veto rules, autonomous stop-outs, fully auditable verdicts. Strategy also published as a Bitget GetAgent Playbook.
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
> 🛡️ Risk — 7 veto rules + autonomous stop-outs
>
> 3/ The signature move: it says NO. High volatility into crowded funding → REJECT, with the reason. It's adaptive by regime: trend-follow, mean-revert, or stay flat when unclear. Qwen 3.6 narrates but never overrides the engine.
>
> 4/ Engage Autopilot and it trades BTC/ETH/DOGE on its own — watch the live activity feed. No human in the loop.
>
> 5/ Proof: 90-day backtest, +8.94% at 3.6% max drawdown, 54 rejections, full CSV trade log on GitHub. Strategy also published on @Bitget_AI GetAgent Playbook.
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
