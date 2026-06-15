// All tunable weights & thresholds in one place.
export const WEIGHTS = {
  trend: 0.30,
  momentum: 0.20,
  sentiment: 0.15,
  volatilityPenalty: 0.15,
  fundingCrowdedness: 0.10,
  newsRisk: 0.10,
};

export const THRESHOLDS = {
  scoreFloor: 50,          // below → REJECT
  minRewardRisk: 1.5,      // below → REJECT
  extremeVolScore: 90,     // above → REJECT
  symbolExposureCap: 0.40, // fraction of equity per symbol → MODIFY
  maxDrawdown: 0.20,       // 20% account drawdown → REJECT all new
  crowdedFunding: 80,      // funding score above + weak trend → MODIFY/REJECT
  weakTrend: 55,
};

export const RISK_SIZING = {
  baseFraction: 0.10,      // 10% of equity at Low risk
  riskMultiplier: { Low: 1.0, Medium: 0.6, High: 0.3, Extreme: 0.0 },
};

export const ATR_MULT = { stop: 1.5, target: 3.0 }; // TP:SL = 2:1 base
