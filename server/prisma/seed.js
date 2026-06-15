import { prisma } from "../src/db.js";
import { scoreTrade } from "../src/engines/scoring.js";
import { assessRisk } from "../src/engines/risk.js";
import { openPosition, evaluatePosition } from "../src/engines/simBroker.js";

const SYMBOLS = {
  BTCUSDT: { price: 60000, atr: 1200, drift: 0.0008, vol: 0.02 },
  ETHUSDT: { price: 3200, atr: 95, drift: 0.0006, vol: 0.025 },
  DOGEUSDT: { price: 0.15, atr: 0.02, drift: -0.0002, vol: 0.06 },
};

// Deterministic pseudo-random (seeded) so seed is reproducible.
function rng(seed) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}

function ctxFrom(sym, price, atr, rand) {
  const t = Math.round(40 + rand() * 50);
  const m = Math.round(35 + rand() * 55);
  const vScore = sym === "DOGEUSDT" ? Math.round(80 + rand() * 18) : Math.round(35 + rand() * 50);
  return {
    symbol: sym, price, atr,
    trend: { label: "x", score: t }, momentum: { label: "x", score: m },
    volatility: { label: "x", score: vScore }, sentiment: { label: "x", score: Math.round(40 + rand() * 45) },
    funding: { label: "x", score: Math.round(20 + rand() * 70) },
    newsImpact: { label: "x", score: Math.round(30 + rand() * 60), blackout: rand() > 0.97 },
  };
}

async function main() {
  await prisma.trade.deleteMany();
  await prisma.position.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.portfolioSnapshot.deleteMany();
  await prisma.marketSnapshot.deleteMany();

  let equity = 10000, peak = 10000;
  const rand = rng(42);
  const start = Date.now() - 90 * 864e5;
  const prices = Object.fromEntries(Object.entries(SYMBOLS).map(([k, v]) => [k, v.price]));

  for (let day = 0; day < 90; day++) {
    const when = new Date(start + day * 864e5);
    for (const [sym, cfg] of Object.entries(SYMBOLS)) {
      prices[sym] *= 1 + cfg.drift + (rand() - 0.5) * cfg.vol;
      const price = +prices[sym].toFixed(sym === "DOGEUSDT" ? 5 : 2);
      const ctx = ctxFrom(sym, price, cfg.atr, rand);
      const decision = scoreTrade(ctx);
      const exposureBySymbol = {};
      const open = await prisma.position.findMany({ where: { status: "OPEN", symbol: sym } });
      for (const p of open) exposureBySymbol[sym] = (exposureBySymbol[sym] || 0) + p.entryPrice * p.size;
      const drawdown = (peak - equity) / peak;
      const risk = assessRisk({ ctx, decision, portfolio: { equity, drawdown, exposureBySymbol } });

      const d = await prisma.decision.create({
        data: {
          symbol: sym, intent: `auto ${sym}`, direction: decision.direction, tradeScore: decision.tradeScore,
          confidence: decision.confidence, riskLevel: risk.riskLevel, verdict: risk.verdict,
          vetoes: risk.vetoes, reasoning: `seed ${risk.verdict}`, marketContext: ctx, createdAt: when,
        },
      });

      if (risk.verdict !== "REJECT" && risk.maxPositionSize > 0) {
        const pos = openPosition({ symbol: sym, side: decision.direction, entryPrice: price, size: risk.maxPositionSize, stopLoss: risk.stopLoss, takeProfit: risk.takeProfit });
        const row = await prisma.position.create({ data: { ...pos, decisionId: d.id, openedAt: when } });
        await prisma.trade.create({ data: { positionId: row.id, action: "OPEN", price, size: risk.maxPositionSize, reason: "seed open", source: "agent", createdAt: when } });
      }

      // Evaluate existing opens against today's price (monitor simulation)
      for (const p of await prisma.position.findMany({ where: { status: "OPEN", symbol: sym } })) {
        const ev = evaluatePosition(p, price);
        if (ev.action === "CLOSE") {
          equity += ev.pnl; peak = Math.max(peak, equity);
          await prisma.position.update({ where: { id: p.id }, data: { status: "CLOSED", exitPrice: ev.exitPrice, exitReason: ev.reason, pnl: ev.pnl, closedAt: when } });
          await prisma.trade.create({ data: { positionId: p.id, action: "CLOSE", price: ev.exitPrice, size: p.size, reason: ev.reason, source: "monitor", createdAt: when } });
        }
      }
    }
    const openNow = await prisma.position.count({ where: { status: "OPEN" } });
    await prisma.portfolioSnapshot.create({
      data: { equity: +equity.toFixed(2), exposure: 0, openPositions: openNow, drawdown: +((peak - equity) / peak).toFixed(4), riskScore: 20, createdAt: when },
    });
  }
  console.log("Seed complete. Equity:", equity.toFixed(2));
}

main().finally(() => prisma.$disconnect());
