# RiskPilot AI — Submission Materials

## Track 1 — Project Description (<200 words)

> **RiskPilot AI — the trading agent that decides whether a trade should happen at all.**
>
> Most agents chase profit. RiskPilot evaluates trade *quality and risk* first — and is the only one that says **no**.
>
> **The problem:** autonomous agents that blindly execute signals blow up accounts. Traders need an agent whose judgment they can audit.
>
> **The loop:**
> - **Perception** — pulls trend, momentum, volatility, sentiment, funding, and news into a structured market context (Bitget Skill Hub).
> - **Decision** — a deterministic, reproducible engine scores the trade and picks a direction.
> - **Execution** — approved trades open simulated positions with risk-based sizing and SL/TP (Bitget Agent Hub).
> - **Risk Management** — seven veto rules return **APPROVE / MODIFY / REJECT**; a background monitor auto-closes positions at stop-loss with no human in the loop.
>
> Qwen 3.6 Plus narrates every verdict but never changes it, so decisions stay auditable.
>
> **Evidence:** a 90-day backtest run by the real engine — ~200 trades, 54 rejections, autonomous stop-outs, +8.9% PnL at 3.6% max drawdown. Every external call has a cached fallback, so the demo never breaks.
>
> **Bitget modules:** Skill Hub, Agent Hub, Qwen 3.6 Plus.

*(Word count: ~190)*

---

## Community Post (X / Telegram)

**Version A — short:**

> Built RiskPilot AI for #BitgetHackathon 🛡️
>
> Most trading agents chase profit. Mine asks a harder question: *should this trade happen at all?*
>
> It runs the full loop — perception → decision → execution → risk — and it's the only agent that says **NO**. 7 veto rules, autonomous stop-outs, fully auditable verdicts.
>
> Powered by @BitgetGlobal Skill Hub + Agent Hub + Qwen 3.6 Plus.
>
> [demo link] [video link]

**Version B — thread (if you want reach):**

> 1/ Built RiskPilot AI for #BitgetHackathon — an autonomous trading agent with one obsession: risk. 🛡️
>
> Most agents optimize "how do I make money?" RiskPilot optimizes "should I even take this trade?"
>
> 2/ It runs the complete Bitget loop:
> 🔍 Perception (Skill Hub: trend, sentiment, funding, news)
> 🧠 Decision (deterministic, reproducible scoring)
> ⚡ Execution (Agent Hub, simulated)
> 🛡️ Risk (7 veto rules + auto stop-outs)
>
> 3/ The signature move: it can REJECT a trade. Ask it to buy a high-volatility coin into crowded funding and it refuses — and tells you exactly why. Qwen 3.6 Plus narrates the verdict but never overrides it.
>
> 4/ Proof, not promises: a 90-day backtest from the real engine — ~200 trades, 54 rejections, autonomous stop-outs, +8.9% PnL at 3.6% max drawdown. Runs live, never breaks (cached fallback on every call).
>
> Built on @BitgetGlobal Agent Hub + Skill Hub + Qwen.
>
> [demo link] [video link]

---

## Submission Checklist (Track 1)

- [ ] Demo link — public, runnable (Vercel URL)
- [ ] Project description — paste the <200-word block above
- [ ] Demo video (optional, ≤3 min) — follow README demo script
- [ ] Repost Bitget official interaction post + publish your post (#BitgetHackathon, @ Bitget AI) → include links in submission for the Community Impact Award
- [ ] Development diary / post → qualifies for the Participation Award (+50 USDT)

> Replace `@BitgetGlobal` with the exact official Bitget AI handle from the hackathon page before posting, and swap in your real demo/video links.
