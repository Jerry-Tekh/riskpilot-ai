# Bitget GetAgent Playbook — Published + Backtested

The RiskPilot risk-first thesis is published as a **Bitget GetAgent Playbook**
("RiskPilot Adaptive Regime") and backtested on **Bitget's own managed platform**
over real BTCUSDT perpetual data. Package source: [`playbook/riskpilot-adaptive-regime/`](../../playbook/riskpilot-adaptive-regime).

**Public link:** https://www.bitget.com/en/activity/ai-get-agent/playbook/f843acbc-92db-494d-9af5-1d71b4da95ff

## Publication (confirmed by Bitget GetAgent control plane)

```json
{
  "strategy_id": "071fcb14-fca9-4ab6-9491-e8e33128a287",
  "version_id": "f843acbc-92db-494d-9af5-1d71b4da95ff",
  "playbook_id": "f843acbc-92db-494d-9af5-1d71b4da95ff",
  "version": "0.0.1",
  "status": "published",
  "published_at": "2026-06-20T08:51:05Z"
}
```

## Official backtest result (run in Bitget's sandbox, real data)

| Metric | Value |
|---|---|
| Market / venue | BTCUSDT perpetual, 1-hour bars |
| Window | 2026-05-09 → 2026-06-20 (live recent data, 1000 bars) |
| Total trades | 60 fills / 30 round-trip positions |
| Win rate | 43.3% |
| Profit factor | 1.60 |
| Sharpe ratio | 1.91 |
| Net PnL (margin basis) | breakeven (+0.02 on 100 USDT margin budget) |
| Equity-curve points | 1000 (real curve, anti-fabrication check passed) |

**Honest read:** over a choppy, range-bound ~6-week window, this risk-first /
selective strategy came out roughly **breakeven with a 1.60 profit factor and a
1.91 Sharpe** — disciplined behavior in an unfavorable regime, not an inflated
number. The strategy's edge is in *not over-trading* when the market is unclear.
The RiskPilot app's own 90-day engine backtest (+8.97%, see
[`trade-log-sample.csv`](trade-log-sample.csv)) is the headline performance
figure; this Playbook is the **platform-native, reproducible** proof that the
strategy runs on Bitget itself.

## Reproduce it

The full Playbook package (manifest, strategy code, backtest spec) is in
[`playbook/riskpilot-adaptive-regime/`](../../playbook/riskpilot-adaptive-regime).
Upload → run → publish steps are in [`playbook/PUBLISH.md`](../../playbook/PUBLISH.md).
Validate locally:

```bash
python3 ~/.claude/skills/getagent/scripts/validate.py ./playbook/riskpilot-adaptive-regime/
# -> Validation PASSED
```
