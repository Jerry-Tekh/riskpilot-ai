import { WEIGHTS } from "../config/strategy.js";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function scoreTrade(ctx) {
  const positives =
    WEIGHTS.trend * ctx.trend.score +
    WEIGHTS.momentum * ctx.momentum.score +
    WEIGHTS.sentiment * ctx.sentiment.score;
  const penalties =
    WEIGHTS.volatilityPenalty * ctx.volatility.score +
    WEIGHTS.fundingCrowdedness * ctx.funding.score +
    WEIGHTS.newsRisk * (100 - ctx.newsImpact.score);
  const raw = positives - penalties + 50; // recenter
  const tradeScore = clamp(Math.round(raw));

  const bullishness = (ctx.trend.score + ctx.momentum.score) / 2;
  const direction = bullishness >= 55 ? "BUY" : bullishness <= 45 ? "SELL" : "HOLD";

  const signals = [ctx.trend.score, ctx.momentum.score, ctx.sentiment.score];
  const mean = signals.reduce((a, b) => a + b, 0) / signals.length;
  const variance = signals.reduce((a, b) => a + (b - mean) ** 2, 0) / signals.length;
  const dispersion = Math.sqrt(variance);
  const confidence = dispersion < 12 ? "High" : dispersion < 25 ? "Medium" : "Low";

  return { tradeScore, direction, confidence };
}

// Itemized contribution of each signal to the trade score (same math as scoreTrade).
// Returns the baseline + signed contributions that sum to the raw score, plus the clamped total.
export function scoreBreakdown(ctx) {
  const components = [
    { key: "baseline", label: "Baseline", value: 50, kind: "base" },
    { key: "trend", label: "Trend", value: +(WEIGHTS.trend * ctx.trend.score).toFixed(1), kind: "positive", signal: ctx.trend.score },
    { key: "momentum", label: "Momentum", value: +(WEIGHTS.momentum * ctx.momentum.score).toFixed(1), kind: "positive", signal: ctx.momentum.score },
    { key: "sentiment", label: "Sentiment", value: +(WEIGHTS.sentiment * ctx.sentiment.score).toFixed(1), kind: "positive", signal: ctx.sentiment.score },
    { key: "volatility", label: "Volatility", value: -+(WEIGHTS.volatilityPenalty * ctx.volatility.score).toFixed(1), kind: "penalty", signal: ctx.volatility.score },
    { key: "funding", label: "Funding", value: -+(WEIGHTS.fundingCrowdedness * ctx.funding.score).toFixed(1), kind: "penalty", signal: ctx.funding.score },
    { key: "news", label: "News Risk", value: -+(WEIGHTS.newsRisk * (100 - ctx.newsImpact.score)).toFixed(1), kind: "penalty", signal: ctx.newsImpact.score },
  ];
  const raw = components.reduce((a, c) => a + c.value, 0);
  const total = clamp(Math.round(raw));
  return { components, raw: +raw.toFixed(1), total };
}
