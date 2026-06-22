import { THRESHOLDS, RISK_SIZING, ATR_MULT } from "../config/strategy.js";

function riskLevel(volScore) {
  if (volScore >= 90) return "Extreme";
  if (volScore >= 75) return "High";
  if (volScore >= 50) return "Medium";
  return "Low";
}

export function assessRisk({ ctx, decision, portfolio }) {
  const vetoes = [];
  const level = riskLevel(ctx.volatility.score);

  const dir = decision.direction;
  const slDist = ATR_MULT.stop * ctx.atr;
  const tpDist = ATR_MULT.target * ctx.atr;
  const stopLoss = dir === "SELL" ? ctx.price + slDist : ctx.price - slDist;
  const takeProfit = dir === "SELL" ? ctx.price - tpDist : ctx.price + tpDist;
  const rewardRiskRatio = +(tpDist / slDist).toFixed(2);

  // Hard rejects
  if (decision.tradeScore < THRESHOLDS.scoreFloor) vetoes.push("score_floor");
  if (rewardRiskRatio < THRESHOLDS.minRewardRisk) vetoes.push("poor_reward_risk");
  if (ctx.volatility.score > THRESHOLDS.extremeVolScore) vetoes.push("extreme_volatility");
  if (portfolio.drawdown > THRESHOLDS.maxDrawdown) vetoes.push("drawdown_breach");
  if (ctx.newsImpact.blackout) vetoes.push("news_blackout");
  if (ctx.funding.score > THRESHOLDS.crowdedFunding && ctx.trend.score < THRESHOLDS.weakTrend)
    vetoes.push("crowded_funding");

  // Pre-trade conviction checks (run before a position is ever opened)
  // 1. Confidence gate — the scorer measures signal agreement; a noisy/low-confidence
  //    read has no reliable edge, so stay flat rather than guess.
  if (decision.confidence === "Low") vetoes.push("low_confidence");
  // 2. Short-side conviction guard — a short has unbounded upside risk (a meme coin can
  //    double against you), so demand strong bearish conviction AND calm volatility to short.
  const bullishness = (ctx.trend.score + ctx.momentum.score) / 2;
  if (dir === "SELL" &&
      (ctx.volatility.score >= THRESHOLDS.shortMaxVol || bullishness > THRESHOLDS.shortConviction))
    vetoes.push("unconfirmed_short");

  // Sizing
  const mult = RISK_SIZING.riskMultiplier[level];
  let maxPositionSize = (portfolio.equity * RISK_SIZING.baseFraction * mult) / ctx.price;

  // Concentration → MODIFY
  const used = portfolio.exposureBySymbol[ctx.symbol] || 0;
  const capValue = portfolio.equity * THRESHOLDS.symbolExposureCap;
  let modified = false;
  if (used >= capValue) {
    vetoes.push("concentration");
    modified = true;
    maxPositionSize = 0;
  } else if (used + maxPositionSize * ctx.price > capValue) {
    vetoes.push("concentration");
    modified = true;
    maxPositionSize = Math.max(0, (capValue - used) / ctx.price);
  }

  const hardReject = vetoes.some((v) =>
    ["score_floor", "poor_reward_risk", "extreme_volatility", "drawdown_breach", "news_blackout", "crowded_funding", "unconfirmed_short"].includes(v)
  );

  let verdict = "APPROVE";
  if (hardReject) verdict = "REJECT";
  else if (decision.direction === "HOLD" || vetoes.includes("low_confidence")) verdict = "HOLD"; // no edge / no conviction → stay flat
  else if (modified) verdict = "MODIFY";

  if (verdict === "HOLD" || verdict === "REJECT") maxPositionSize = 0; // flat / rejected = no position

  return {
    verdict,
    riskLevel: level,
    stopLoss: +stopLoss.toFixed(2),
    takeProfit: +takeProfit.toFixed(2),
    maxPositionSize: +maxPositionSize.toFixed(6),
    rewardRiskRatio,
    vetoes,
  };
}
