import { describe, it, expect } from "vitest";
import { scoreTrade } from "../src/engines/scoring.js";

const ctx = (o = {}) => ({
  symbol: "BTCUSDT",
  trend: { label: "Bullish", score: 78 },
  momentum: { label: "Strong", score: 71 },
  volatility: { label: "High", score: 60 },
  sentiment: { label: "Neutral", score: 52 },
  funding: { label: "Elevated", score: 38 },
  newsImpact: { label: "Medium", score: 60 },
  ...o,
});

describe("scoreTrade", () => {
  it("is deterministic: same context yields same score", () => {
    expect(scoreTrade(ctx()).tradeScore).toBe(scoreTrade(ctx()).tradeScore);
  });
  it("returns integer score in 0..100", () => {
    const r = scoreTrade(ctx());
    expect(Number.isInteger(r.tradeScore)).toBe(true);
    expect(r.tradeScore).toBeGreaterThanOrEqual(0);
    expect(r.tradeScore).toBeLessThanOrEqual(100);
  });
  it("strong bullish context yields BUY direction", () => {
    expect(scoreTrade(ctx()).direction).toBe("BUY");
  });
  it("weak bearish context yields SELL", () => {
    const r = scoreTrade(ctx({ trend: { label: "Bearish", score: 20 }, momentum: { label: "Weak", score: 25 } }));
    expect(r.direction).toBe("SELL");
  });
  it("high signal agreement => High confidence", () => {
    expect(scoreTrade(ctx()).confidence).toBe("High");
  });
  it("high volatility lowers score vs low volatility", () => {
    const hi = scoreTrade(ctx({ volatility: { label: "High", score: 95 } })).tradeScore;
    const lo = scoreTrade(ctx({ volatility: { label: "Low", score: 10 } })).tradeScore;
    expect(lo).toBeGreaterThan(hi);
  });
});
