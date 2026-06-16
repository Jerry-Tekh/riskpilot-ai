import { describe, it, expect } from "vitest";
import { sma, ema, rsi, macd, realizedVol } from "../src/engines/indicators.js";

describe("indicators", () => {
  it("sma averages the last N values", () => {
    expect(sma([1, 2, 3, 4, 5], 5)).toBe(3);
    expect(sma([2, 4, 6], 2)).toBe(5);
    expect(sma([1], 5)).toBe(null);
  });

  it("ema responds and is bounded by series range", () => {
    const e = ema(Array.from({ length: 20 }, (_, i) => i + 1), 5);
    expect(e).toBeGreaterThan(10);
    expect(e).toBeLessThanOrEqual(20);
  });

  it("rsi is 100 for a monotonically rising series", () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i);
    expect(rsi(closes, 14)).toBe(100);
  });

  it("rsi is low for a falling series", () => {
    const closes = Array.from({ length: 20 }, (_, i) => 120 - i);
    expect(rsi(closes, 14)).toBeLessThan(20);
  });

  it("rsi sits near 50 for an oscillating series", () => {
    const closes = Array.from({ length: 40 }, (_, i) => 100 + (i % 2 === 0 ? 1 : -1));
    const r = rsi(closes, 14);
    expect(r).toBeGreaterThan(35);
    expect(r).toBeLessThan(65);
  });

  it("macd histogram is positive when fast momentum exceeds slow (uptrend)", () => {
    const closes = Array.from({ length: 60 }, (_, i) => 100 * 1.01 ** i); // accelerating uptrend
    const m = macd(closes);
    expect(m).not.toBe(null);
    expect(m.hist).toBeGreaterThan(0);
  });

  it("realizedVol is higher for a volatile series", () => {
    const calm = Array.from({ length: 30 }, (_, i) => 100 + (i % 2 ? 0.1 : -0.1));
    const wild = Array.from({ length: 30 }, (_, i) => 100 * (1 + (i % 2 ? 0.07 : -0.07)));
    expect(realizedVol(wild)).toBeGreaterThan(realizedVol(calm));
  });

  it("returns null when not enough data", () => {
    expect(rsi([1, 2, 3], 14)).toBe(null);
    expect(macd([1, 2, 3])).toBe(null);
  });
});
