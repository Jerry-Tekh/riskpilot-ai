import { describe, it, expect } from "vitest";
import { assessRisk } from "../src/engines/risk.js";

const base = (o = {}) => ({
  ctx: {
    symbol: "BTCUSDT",
    trend: { score: 78 }, momentum: { score: 71 }, volatility: { score: 60 },
    sentiment: { score: 52 }, funding: { score: 38 }, newsImpact: { score: 60, blackout: false },
    price: 64000, atr: 1200,
  },
  decision: { tradeScore: 84, direction: "BUY", confidence: "High" },
  portfolio: { equity: 10000, drawdown: 0.05, exposureBySymbol: {} },
  ...o,
});

describe("assessRisk", () => {
  it("APPROVE on healthy trade with SL/TP and size", () => {
    const r = assessRisk(base());
    expect(r.verdict).toBe("APPROVE");
    expect(r.stopLoss).toBeLessThan(64000);
    expect(r.takeProfit).toBeGreaterThan(64000);
    expect(r.maxPositionSize).toBeGreaterThan(0);
    expect(r.rewardRiskRatio).toBeGreaterThanOrEqual(1.5);
  });
  it("REJECT when score below floor", () => {
    const r = assessRisk(base({ decision: { tradeScore: 40, direction: "BUY", confidence: "Low" } }));
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("score_floor");
  });
  it("REJECT on extreme volatility", () => {
    const b = base(); b.ctx.volatility.score = 95;
    const r = assessRisk(b);
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("extreme_volatility");
  });
  it("REJECT all new on drawdown breach", () => {
    const r = assessRisk(base({ portfolio: { equity: 8000, drawdown: 0.25, exposureBySymbol: {} } }));
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("drawdown_breach");
  });
  it("MODIFY (cut size) on symbol concentration", () => {
    const r = assessRisk(base({ portfolio: { equity: 10000, drawdown: 0.05, exposureBySymbol: { BTCUSDT: 4500 } } }));
    expect(r.verdict).toBe("MODIFY");
    expect(r.vetoes).toContain("concentration");
  });
  it("REJECT on news blackout", () => {
    const b = base(); b.ctx.newsImpact.blackout = true;
    const r = assessRisk(b);
    expect(r.verdict).toBe("REJECT");
    expect(r.vetoes).toContain("news_blackout");
  });
  it("HOLD direction → HOLD verdict with no position", () => {
    const r = assessRisk(base({ decision: { tradeScore: 60, direction: "HOLD", confidence: "Low" } }));
    expect(r.verdict).toBe("HOLD");
    expect(r.maxPositionSize).toBe(0);
  });

  it("riskLevel scales with volatility", () => {
    const hi = base(); hi.ctx.volatility.score = 88;
    expect(["High", "Extreme"]).toContain(assessRisk(hi).riskLevel);
  });
});
