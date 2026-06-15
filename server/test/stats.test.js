import { describe, it, expect } from "vitest";
import { computeStats } from "../src/stats.js";

describe("computeStats", () => {
  it("computes win rate, total pnl, max drawdown", () => {
    const closed = [{ pnl: 100 }, { pnl: -50 }, { pnl: 75 }, { pnl: -25 }];
    const s = computeStats(closed, [10000, 10100, 10050, 10125, 10100]);
    expect(s.totalPnl).toBe(100);
    expect(s.trades).toBe(4);
    expect(s.winRate).toBe(50);
    expect(s.maxDrawdown).toBeGreaterThanOrEqual(0);
  });
  it("handles empty history", () => {
    const s = computeStats([], []);
    expect(s.trades).toBe(0);
    expect(s.winRate).toBe(0);
  });
});
