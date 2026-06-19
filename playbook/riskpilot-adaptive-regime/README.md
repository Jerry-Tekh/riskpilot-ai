# RiskPilot Adaptive Regime

A risk-first BTC perpetual strategy that changes personality with the market — and refuses to trade when the market is unclear.

## 策略 / Strategy

RiskPilot Adaptive Regime is built on one belief: **no single playbook fits every market, and the most reliable edge is knowing when *not* to trade.** Instead of forcing a directional bet at all times, it first reads the market regime from price action and volatility, then acts only when the market clearly expresses one of two personalities — a committed trend, or a stable range. When the read is ambiguous, it captures nothing and waits. It trades BTC perpetual futures and can go both long and short.

## 开仓 / Entry

The strategy classifies the current regime by how far the short-horizon and long-horizon trend reads have separated, normalized by recent volatility:

- **Trend regime** — it trades *with* the trend: long when the short-horizon read leads the long-horizon read upward, short when it leads downward.
- **Range regime** — it *fades extremes* instead: it buys after an exhausted move to the downside and sells after an overstretched move to the upside, using a momentum oscillator.
- **Unclear regime** — trend strength is neither convincing nor cleanly absent, so it **stays flat by design** and opens nothing.

## 平仓 / Exit

Every position carries predefined protection set the moment it opens:

- **Stop loss** — a volatility-scaled stop below (long) or above (short) the entry.
- **Take profit** — a volatility-scaled target at a wider distance than the stop, giving a positive reward-to-risk profile.
- **Regime invalidation** — if the trend that justified a trend-trade flips against the position, it closes immediately rather than waiting for the stop.

Locking in outcomes and cutting invalidated ideas matters more than insisting every trade wins.

## 风险 / Risk

The strategy underperforms during violent transitions between regimes, where a trend read and a range read disagree and whipsaw the position. Gap-driven news shocks and persistent funding-rate dislocations can also produce trapped positions or a string of stops. Higher leverage amplifies both upside and drawdown equally and does **not** make the strategy more selective. Past backtest performance is not a guarantee of live profitability, and live execution pays slippage and exchange fees that erode edge. Only subscribe if you can tolerate the drawdown and regime risk this approach carries.

## Parameters you can tune

- **Trading symbol** — which perpetual to trade (default BTCUSDT).
- **Leverage** — amplifies both gains and losses equally; it does not change selectivity.
- **Margin budget (USDT)** — the per-strategy capital cap the platform sizes orders against, and the denominator for the return-percentage figure. Treat it as the most you are willing to risk on this Playbook.

## Reading the backtest metrics

- **total_return_pct** is the *strategy* return measured against the margin budget (`net_pnl / margin_budget`), not your whole account.
- **max_drawdown_pct** is the deepest peak-to-trough decline over the test window — for a risk-first strategy this should be modest relative to return.
- **win_rate** can be moderate even when the strategy is profitable, because the reward-to-risk target is greater than one: winners are designed to be larger than losers.
- **total_trades** reflects how often a clear regime appeared; long stretches of "unclear" intentionally produce fewer trades.
