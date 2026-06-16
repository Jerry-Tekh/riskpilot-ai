import { describe, it, expect } from "vitest";
import { deriveSignals, fundingScore } from "../src/adapters/bitgetMarket.js";

// Helper: build N daily candles from a list of closes (range = ±0.5% intrabar).
function candlesFromCloses(closes) {
  return closes.map((c) => ({ open: c, high: c * 1.005, low: c * 0.995, close: c }));
}

describe("deriveSignals", () => {
  it("uptrend (price above SMA) yields trend > 50 and BUY-ish momentum", () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i); // steadily rising
    const s = deriveSignals(candlesFromCloses(closes));
    expect(s.trendScore).toBeGreaterThan(50);
    expect(s.momentumScore).toBeGreaterThan(50);
    expect(s.price).toBe(129);
  });

  it("downtrend yields trend < 50", () => {
    const closes = Array.from({ length: 30 }, (_, i) => 130 - i);
    const s = deriveSignals(candlesFromCloses(closes));
    expect(s.trendScore).toBeLessThan(50);
  });

  it("low-volatility series yields low vol score; high-volatility yields extreme", () => {
    const calm = Array.from({ length: 30 }, (_, i) => 100 + (i % 2 === 0 ? 0.2 : -0.2)); // ~0.2% wiggles
    const wild = Array.from({ length: 30 }, (_, i) => 100 * (1 + (i % 2 === 0 ? 0.08 : -0.08))); // ~8% swings
    expect(deriveSignals(candlesFromCloses(calm)).volatilityScore).toBeLessThan(50);
    expect(deriveSignals(candlesFromCloses(wild)).volatilityScore).toBeGreaterThanOrEqual(90);
  });

  it("formats sub-dollar prices with more precision", () => {
    const s = deriveSignals(candlesFromCloses(Array.from({ length: 30 }, () => 0.16234)));
    expect(s.price).toBe(0.16234);
  });
});

describe("fundingScore", () => {
  it("near-zero funding is not crowded; large funding is crowded", () => {
    expect(fundingScore(-0.000089)).toBeLessThan(40);
    expect(fundingScore(0.0005)).toBeGreaterThanOrEqual(80);
  });
});
