import "dotenv/config";
import app from "./app.js";
import { prisma } from "./db.js";
import { startMonitor } from "./monitor.js";
import { getSkills } from "./adapters/skillHub.js";
import { getPortfolioState } from "./portfolioState.js";

const port = process.env.PORT || 4000;

async function priceFor(symbol) {
  const s = await getSkills(symbol);
  return s.price; // live price when wired; cached otherwise. Monitor still acts on SL/TP.
}

app.listen(port, () => {
  console.log(`RiskPilot API on :${port}`);
  startMonitor({ prisma, priceFor, getPortfolioState, intervalMs: Number(process.env.MONITOR_INTERVAL_MS) || 30000 });
});
