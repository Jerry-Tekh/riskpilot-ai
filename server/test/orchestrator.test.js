import { describe, it, expect } from "vitest";
import { buildContext, decide } from "../src/orchestrator.js";

describe("orchestrator pure parts", () => {
  it("buildContext maps skills payload to MarketContext", async () => {
    const ctx = await buildContext("BTCUSDT");
    expect(ctx.symbol).toBe("BTCUSDT");
    expect(ctx.trend.score).toBeGreaterThan(0);
    expect(["live", "cached"]).toContain(ctx.dataSource);
  });
  it("decide returns verdict + reasoning for a healthy portfolio", async () => {
    const ctx = await buildContext("BTCUSDT");
    const out = await decide(ctx, { equity: 10000, drawdown: 0.05, exposureBySymbol: {} }, "Trade BTC");
    expect(["APPROVE", "MODIFY", "REJECT"]).toContain(out.verdict);
    expect(out.reasoning.length).toBeGreaterThan(0);
    expect(out.tradeScore).toBeGreaterThanOrEqual(0);
  });
  it("DOGE context rejects (extreme vol)", async () => {
    const ctx = await buildContext("DOGEUSDT");
    const out = await decide(ctx, { equity: 10000, drawdown: 0.05, exposureBySymbol: {} }, "Trade DOGE");
    expect(out.verdict).toBe("REJECT");
  });
});
