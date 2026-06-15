import { Router } from "express";
import { prisma } from "../db.js";
import { computeStats } from "../stats.js";

const r = Router();

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

r.get("/stats", async (_req, res) => {
  const closed = await prisma.position.findMany({ where: { status: "CLOSED" } });
  const snaps = await prisma.portfolioSnapshot.findMany({ orderBy: { createdAt: "asc" } });
  const rejected = await prisma.decision.count({ where: { verdict: "REJECT" } });
  const stats = computeStats(closed, snaps.map((s) => s.equity));
  res.json({ ...stats, rejected });
});

export default r;
