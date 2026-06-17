# RiskPilot AI — 3-Minute Demo Video Script

**Target length:** 2:50 (stay under the 3:00 hard cap).
**Demo URL:** https://riskpilotai.vercel.app
**Golden rule:** show, don't tell. Let the agent *do* things on screen.

---

## Before you hit record (5-minute prep)

1. **Reset to a clean, rich state** so the Trade Log looks credible and a live APPROVE is possible:
   - Railway → service → it reseeds only if empty, so to force a fresh 90-day set: open Railway **Console/Shell** and run `npm run seed`. (Optional — only if your log looks messy from testing.)
2. Open the site, hard-refresh (Ctrl+Shift+R). Confirm the top bar shows **AGENT ● ONLINE**.
3. Have these ready in your head: type `Trade BTC using current conditions`, then later the Autopilot toggle, a Stress Test button, and the Deep Analysis button.
4. Screen-record at 1920×1080. Close other tabs. Zoom browser to ~110% so text reads on video.
5. Speak in short, confident sentences. Pauses are fine — let visuals breathe.

---

## The Script (timed)

### [0:00–0:18] — Hook + the one idea
**On screen:** Land on the **Console** page (the header/logo visible).

> "This is RiskPilot AI — an autonomous crypto trading agent. But it's built around one idea most trading bots ignore: **the best trade is often no trade.** Every other agent asks 'how do I make money?' RiskPilot asks 'should this trade happen at all?' — and it's the only one that says no."

*(Tip: say this over the clean Console so the viewer settles in.)*

---

### [0:18–0:45] — The full loop, in one command
**On screen:** Click into the command bar, type `Trade BTC using current conditions`, click **Run Loop**. Let the four stages light up.

> "I give it a plain-language command. Watch the loop run end to end — **Perception**: it pulls live Bitget market data, real RSI, MACD, and the Fear & Greed index. **Decision**: a deterministic engine scores the trade. **Execution and Risk**: it sizes the position and sets stops — autonomously."

**On screen:** The verdict card appears (e.g. APPROVE/HOLD with score, SL/TP).

> "There's the verdict — with entry, stop-loss, take-profit, and the agent's reasoning, written live by Qwen."

---

### [0:45–1:08] — Explainable, not a black box (Waterfall)
**On screen:** Scroll slightly to the **Score Breakdown waterfall** under the verdict.

> "And this isn't a black box. Every score is auditable — here's exactly how it was built: a baseline, plus trend and momentum, minus penalties for volatility and crowded funding. The math reconciles to the final number. No hallucinations, fully reproducible."

---

### [1:08–1:38] — The differentiator: it says NO (Stress Test)
**On screen:** Go to **Risk Center** → **Stress Test** panel. Click **Volatility Spike** (or **Drawdown Breach**).

> "Here's what makes it risk-first. I can stress-test the agent. Let me inject a volatility spike."

**On screen:** Verdict flips to **REJECT** (red) with veto chips.

> "Rejected. Seven independent veto rules — extreme volatility, crowded funding, drawdown breach, concentration — any one of them can kill a trade before it's placed. *This* is the difference between an agent and a gambler."

*(Click one more — e.g. Drawdown Breach — to show it's not a one-off.)*

---

### [1:38–2:15] — It runs itself (Autopilot — the wow moment)
**On screen:** Go to the **Autopilot** tab. Click **Engage Autopilot**.

> "Now the part that makes it a true agent. I engage Autopilot — and step away."

**On screen:** Status flips to **ENGAGED** (green pulse). The **live activity feed** starts streaming rows.

> "No human in the loop. It's now scanning BTC, ETH, and DOGE on a cycle, running the full loop on each, opening positions when the edge is there — and holding flat when it isn't. Watch the feed: perceive, decide, execute. And when a position hits its stop, the background monitor closes it on its own."

*(Let 3–4 feed rows appear. Point cursor at a `MONITOR` auto-close row if one shows.)*

---

### [2:15–2:42] — Proof it works (Evidence)
**On screen:** Go to **Trade Log**. Show the stats header + equity curve.

> "And it's all backed by evidence — a 90-day backtest run by the same engine: win rate, Sharpe, max drawdown, and the number of trades it *rejected*. Every decision and every autonomous close is logged and verifiable."

*(Scroll the Decision Log / Execution Log briefly to show REJECT rows and `monitor` source rows.)*

---

### [2:42–2:50] — Close
**On screen:** Back to the top bar / Console, or hold on the live URL.

> "RiskPilot AI — perception, decision, execution, and risk, fully autonomous, on live data. The agent that knows when not to trade. Thanks for watching."

**On screen:** End card / show the URL: **riskpilotai.vercel.app**

---

## Shot checklist (so nothing's missed)
- [ ] Console: Run Loop → verdict card
- [ ] Score waterfall visible
- [ ] Stress Test → REJECT (red) with vetoes
- [ ] Autopilot → ENGAGED + streaming feed
- [ ] Trade Log: stats header + equity curve + a REJECT row + a `monitor` row
- [ ] End on the public URL

## Backup plan (if live market gives a boring verdict)
- If `Trade BTC` returns HOLD/MODIFY and you want a clean APPROVE on camera, try `Trade ETH` or run it a second time — or just lean into HOLD: "notice it chose to stay flat — discipline, not FOMO."
- The **Stress Test REJECT is your guaranteed money shot** — it works every time regardless of the live market. Make sure it's in the video.
- If Autopilot feed is slow, the first row ("Autopilot ENGAGED") plus 1–2 decision rows is enough — don't wait awkwardly.

## Voiceover tips
- Record video first (silent), then voice over it — far easier to stay on time.
- ~430 words of script ≈ 2:50 at a natural pace. Don't rush; cut a sentence if you run long.
- Energy up on "and it's the only one that says no" and "I engage Autopilot — and step away."
