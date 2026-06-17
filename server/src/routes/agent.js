import { Router } from "express";
import { prisma } from "../db.js";
import { runLoop, buildContext, decide, deepAnalysis, stressTest } from "../orchestrator.js";
import { SCENARIOS } from "../engines/scenarios.js";
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

r.get("/scenarios", (_req, res) => res.json(SCENARIOS));

r.post("/stress", async (req, res) => {
  try {
    const symbol = (req.body.symbol || "BTCUSDT").toUpperCase();
    const scenario = req.body.scenario;
    if (!SCENARIOS[scenario]) return res.status(400).json({ error: `unknown scenario: ${scenario}` });
    const portfolio = await getPortfolioState();
    res.json(await stressTest(symbol, scenario, portfolio));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

r.post("/deep-analysis", async (req, res) => {
  try {
    const symbol = (req.body.symbol || "BTCUSDT").toUpperCase();
    const portfolio = await getPortfolioState();
    res.json(await deepAnalysis(symbol, portfolio));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default r;
