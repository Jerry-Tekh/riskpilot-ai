import { Router } from "express";
import { prisma } from "../db.js";
import { computeStats } from "../stats.js";
import { getMetrics } from "../metrics.js";

const r = Router();

r.get("/metrics", async (_req, res) => {
  res.json(await getMetrics(prisma));
});

r.get("/positions", async (req, res) => {
  const where = req.query.status ? { status: String(req.query.status).toUpperCase() } : {};
  res.json(await prisma.position.findMany({ where, orderBy: { openedAt: "desc" } }));
});

r.get("/trades", async (_req, res) => {
  res.json(await prisma.trade.findMany({ orderBy: { createdAt: "desc" }, take: 200 }));
});

r.get("/decisions", async (_req, res) => {
  res.json(await prisma.decision.findMany({ orderBy: { createdAt: "desc" }, take: 200 }));
});

// Compliant trade-log export (CSV): timestamp, pair, direction, price, quantity,
// pnl, and running account balance — the fields the hackathon submission requires.
r.get("/trades/export.csv", async (_req, res) => {
  const STARTING_EQUITY = 10000;
  const trades = await prisma.trade.findMany({
    orderBy: { createdAt: "asc" },
    include: { position: true },
  });
  let balance = STARTING_EQUITY;
  const header = ["timestamp", "trading_pair", "action", "direction", "price", "quantity", "realized_pnl", "account_balance"];
  const rows = [header.join(",")];
  for (const t of trades) {
    const pnl = t.action === "CLOSE" ? (t.position?.pnl ?? 0) : 0;
    balance += pnl;
    rows.push([
      new Date(t.createdAt).toISOString(),
      t.position?.symbol ?? "",
      t.action,
      t.position?.side ?? "",
      t.price,
      t.size,
      pnl.toFixed(2),
      balance.toFixed(2),
    ].join(","));
  }
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="riskpilot-trade-log.csv"');
  res.send(rows.join("\n"));
});

r.get("/stats", async (_req, res) => {
  const closed = await prisma.position.findMany({ where: { status: "CLOSED" } });
  const snaps = await prisma.portfolioSnapshot.findMany({ orderBy: { createdAt: "asc" } });
  const rejected = await prisma.decision.count({ where: { verdict: "REJECT" } });
  const stats = computeStats(closed, snaps.map((s) => s.equity));
  res.json({ ...stats, rejected });
});

export default r;
