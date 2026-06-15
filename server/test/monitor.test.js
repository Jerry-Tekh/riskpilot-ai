import { describe, it, expect } from "vitest";
import { tickPositions } from "../src/monitor.js";

describe("tickPositions", () => {
  it("closes a position whose stop is hit and records a monitor trade", async () => {
    const calls = { update: [], trade: [] };
    const fakePrisma = {
      position: {
        findMany: async () => [{ id: "p1", side: "BUY", entryPrice: 100, size: 1, stopLoss: 95, takeProfit: 110, status: "OPEN", symbol: "BTCUSDT" }],
        update: async (a) => calls.update.push(a),
      },
      trade: { create: async (a) => calls.trade.push(a) },
      portfolioSnapshot: { create: async () => {} },
    };
    await tickPositions({ prisma: fakePrisma, priceFor: async () => 94, getPortfolioState: async () => ({ equity: 10000, exposure: 0, drawdown: 0 }) });
    expect(calls.update[0].data.status).toBe("CLOSED");
    expect(calls.trade[0].data.source).toBe("monitor");
  });
});
