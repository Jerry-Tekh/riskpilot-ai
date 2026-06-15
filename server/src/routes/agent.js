import { Router } from "express";
import { prisma } from "../db.js";
import { runLoop, buildContext, decide } from "../orchestrator.js";
import { getPortfolioState } from "../portfolioState.js";

const r = Router();

r.post("/run", async (req, res) => {
  try {
    const out = await runLoop({ command: req.body.command || "Trade BTC", prisma, getPortfolioState });
    res.json(out);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post("/analyze", async (req, res) => {
  try {
    const ctx = await buildContext((req.body.symbol || "BTCUSDT").toUpperCase());
    const portfolio = await getPortfolioState();
    const result = await decide(ctx, portfolio, `Analyze ${ctx.symbol}`);
    res.json({ context: ctx, result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default r;
