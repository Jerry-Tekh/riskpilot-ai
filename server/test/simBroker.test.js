import { describe, it, expect } from "vitest";
import { openPosition, evaluatePosition, computePnl } from "../src/engines/simBroker.js";

describe("simBroker", () => {
  it("opens a long position", () => {
    const p = openPosition({ symbol: "BTCUSDT", side: "BUY", entryPrice: 64000, size: 0.1, stopLoss: 62800, takeProfit: 67100 });
    expect(p.status).toBe("OPEN");
    expect(p.side).toBe("BUY");
  });
  it("computePnl for long is positive when price rises", () => {
    expect(computePnl({ side: "BUY", entryPrice: 100, size: 2 }, 110)).toBe(20);
  });
  it("computePnl for short is positive when price falls", () => {
    expect(computePnl({ side: "SELL", entryPrice: 100, size: 2 }, 90)).toBe(20);
  });
  it("evaluatePosition closes long at stop loss", () => {
    const pos = { side: "BUY", entryPrice: 100, size: 1, stopLoss: 95, takeProfit: 110, status: "OPEN" };
    const r = evaluatePosition(pos, 94);
    expect(r.action).toBe("CLOSE");
    expect(r.reason).toContain("stop");
  });
  it("evaluatePosition closes long at take profit", () => {
    const pos = { side: "BUY", entryPrice: 100, size: 1, stopLoss: 95, takeProfit: 110, status: "OPEN" };
    const r = evaluatePosition(pos, 111);
    expect(r.action).toBe("CLOSE");
    expect(r.reason).toContain("take-profit");
  });
  it("evaluatePosition holds when price between SL and TP", () => {
    const pos = { side: "BUY", entryPrice: 100, size: 1, stopLoss: 95, takeProfit: 110, status: "OPEN" };
    expect(evaluatePosition(pos, 103).action).toBe("HOLD");
  });
});
