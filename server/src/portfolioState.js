import { prisma } from "./db.js";

const STARTING_EQUITY = 10000;

export async function getPortfolioState() {
  const open = await prisma.position.findMany({ where: { status: "OPEN" } });
  const closed = await prisma.position.findMany({ where: { status: "CLOSED" } });
  const realized = closed.reduce((a, p) => a + (p.pnl ?? 0), 0);
  const equity = STARTING_EQUITY + realized;
  const exposureBySymbol = {};
  for (const p of open) exposureBySymbol[p.symbol] = (exposureBySymbol[p.symbol] || 0) + p.entryPrice * p.size;
  const exposure = Object.values(exposureBySymbol).reduce((a, b) => a + b, 0);

  // drawdown from peak equity over snapshots
  const snaps = await prisma.portfolioSnapshot.findMany({ orderBy: { createdAt: "asc" } });
  const curve = snaps.map((s) => s.equity).concat(equity);
  let peak = -Infinity, dd = 0;
  for (const e of curve) { if (e > peak) peak = e; if (peak > 0) dd = Math.max(dd, (peak - e) / peak); }

  return { equity, exposure, exposureBySymbol, drawdown: +dd.toFixed(4), openCount: open.length, STARTING_EQUITY };
}
