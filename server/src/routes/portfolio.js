import { Router } from "express";
import { prisma } from "../db.js";
import { getPortfolioState } from "../portfolioState.js";

const r = Router();

r.get("/summary", async (_req, res) => {
  const st = await getPortfolioState();
  const riskScore = Math.min(100, Math.round((st.exposure / (st.equity || 1)) * 100 + st.drawdown * 100));
  res.json({ ...st, riskScore });
});

r.get("/history", async (_req, res) => {
  res.json(await prisma.portfolioSnapshot.findMany({ orderBy: { createdAt: "asc" } }));
});

export default r;
