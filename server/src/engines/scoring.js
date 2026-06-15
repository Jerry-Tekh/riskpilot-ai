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
