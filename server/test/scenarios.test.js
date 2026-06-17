import { describe, it, expect } from "vitest";
import { applyScenario, SCENARIOS } from "../src/engines/scenarios.js";
import { scoreTrade } from "../src/engines/scoring.js";
import { assessRisk } from "../src/engines/risk.js";

const baseCtx = () => ({
  symbol: "BTCUSDT",
  trend: { label: "Bullish", score: 78 }, momentum: { label: "Strong", score: 71 },
  volatility: { label: "Medium", score: 50 }, sentiment: { label: "Neutral", score: 52 },
  funding: { label: "Normal", score: 30 }, newsImpact: { label: "Low", score: 70, blackout: false },
  price: 64000, atr: 1200,
});
const basePf = () => ({ equity: 10000, drawdown: 0.03, exposureBySymbol: {} });

function verdictFor(scenario) {
  const { ctx, portfolio } = applyScenario(baseCtx(), basePf(), scenario);
  const decision = scoreTrade(ctx);
  return assessRisk({ ctx, decision, portfolio });
}

describe("applyScenario", () => {
  it("does not mutate the inputs", () => {
    const ctx = baseCtx(); const pf = basePf();
    applyScenario(ctx, pf, "volatility_spike");
    expect(ctx.volatility.score).toBe(50);
    expect(pf.drawdown).toBe(0.03);
  });

  it("volatility_spike → REJECT (extreme_volatility)", () => {
    const r = verdictFor("volatility_spike");
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("extreme_volatility");
  });

  it("crowded_funding → REJECT (crowded_funding)", () => {
    const r = verdictFor("crowded_funding");
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("crowded_funding");
  });

  it("drawdown_breach → REJECT (drawdown_breach)", () => {
    const r = verdictFor("drawdown_breach");
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("drawdown_breach");
  });

  it("bear_capitulation → REJECT (score_floor)", () => {
    const r = verdictFor("bear_capitulation");
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("score_floor");
  });

  it("news_blackout → REJECT (news_blackout)", () => {
    const r = verdictFor("news_blackout");
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("news_blackout");
  });

  it("every scenario key has metadata", () => {
    for (const k of Object.keys(SCENARIOS)) {
      expect(SCENARIOS[k].label).toBeTruthy();
      expect(SCENARIOS[k].desc).toBeTruthy();
    }
  });
});
