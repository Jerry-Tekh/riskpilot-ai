import { evaluatePosition } from "./engines/simBroker.js";
import { recordActivity } from "./activity.js";

export async function tickPositions({ prisma, priceFor, getPortfolioState }) {
  const open = await prisma.position.findMany({ where: { status: "OPEN" } });
  for (const pos of open) {
    const price = await priceFor(pos.symbol);
    const r = evaluatePosition(pos, price);
    if (r.action === "CLOSE") {
      await prisma.position.update({
        where: { id: pos.id },
        data: { status: "CLOSED", exitPrice: r.exitPrice, exitReason: r.reason, pnl: r.pnl, closedAt: new Date() },
      });
      await prisma.trade.create({
        data: { positionId: pos.id, action: "CLOSE", price: r.exitPrice, size: pos.size, reason: r.reason, source: "monitor" },
      });
      recordActivity("monitor", `Auto-closed ${pos.symbol.replace("USDT", "")} · ${r.reason} · PnL ${r.pnl >= 0 ? "+" : ""}${r.pnl}`, { symbol: pos.symbol, pnl: r.pnl });
    }
  }
  const st = await getPortfolioState();
  await prisma.portfolioSnapshot.create({
    data: {
      equity: st.equity, exposure: st.exposure, openPositions: st.openCount ?? 0, drawdown: st.drawdown ?? 0,
      riskScore: Math.min(100, Math.round((st.exposure / (st.equity || 1)) * 100)),
    },
  });
}

export function startMonitor({ prisma, priceFor, getPortfolioState, intervalMs }) {
  return setInterval(() => tickPositions({ prisma, priceFor, getPortfolioState }).catch(() => {}), intervalMs);
}
