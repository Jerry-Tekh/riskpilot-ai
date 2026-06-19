# RiskPilot — Bitget GetAgent Playbook

This folder contains the **RiskPilot Adaptive Regime** strategy, authored as a
[Bitget GetAgent Playbook](https://www.bitget.com/) — a strategy that runs and
backtests on Bitget's own managed platform.

It is the strategy thesis behind the RiskPilot AI agent, expressed as a real,
publishable, reproducibly-backtested Bitget Playbook:

> **Trend-follow when trending, mean-revert when ranging, and stay flat when the
> market is unclear** — with ATR-scaled stop-loss / take-profit and a
> regime-invalidation exit. Risk-first: the disciplined "do nothing when
> unclear" branch is the edge.

## Package

```
riskpilot-adaptive-regime/
├── manifest.yaml     # identity, public contract, tunables (symbol/leverage/margin)
├── backtest.yaml     # Nautilus replay spec (BTCUSDT perp, hourly, with fees)
├── README.md         # subscriber-facing strategy explanation
└── src/
    ├── main.py       # sandbox entry point — fetches data, runs backtest, emits signal
    └── strategy.py   # AdaptiveRegimeStrategy — the Nautilus strategy logic
```

## Validate locally

```bash
python3 ~/.claude/skills/getagent/scripts/validate.py ./riskpilot-adaptive-regime/
# -> Validation PASSED
```

## Publish (authenticated — needs your Playbook API Key)

The upload → backtest → publish flow runs against GetAgent Cloud and requires
your Bitget Playbook API Key. See `PUBLISH.md` for the exact steps.

Once published, the strategy gets a public marketplace link and a real backtest
report (equity curve, return, drawdown, Sharpe, win rate) generated on Bitget's
platform — a reproducible artifact for the hackathon submission.
