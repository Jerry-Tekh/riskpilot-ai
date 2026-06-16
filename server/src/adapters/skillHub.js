import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { withFallback } from "./withFallback.js";
import { getLiveMarket } from "./bitgetMarket.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cacheDir = join(__dirname, "../cache");

function readCache(symbol) {
  return JSON.parse(readFileSync(join(cacheDir, `skills.${symbol}.json`), "utf-8"));
}

// Live: market signals (trend/momentum/volatility/funding/price/atr) from Bitget public API.
// Sentiment & news come from the analyst Skill fixtures (Skill Hub Skills are MCP-only),
// so we overlay live market data on top of the cached sentiment/news.
async function liveSkills(symbol) {
  if (process.env.SKILLHUB_LIVE !== "true") throw new Error("live skills disabled (set SKILLHUB_LIVE=true)");
  const market = await getLiveMarket(symbol);
  const cached = readCache(symbol);
  return {
    ...market,
    sentiment: cached.sentiment,
    newsImpact: cached.newsImpact,
  };
}

export async function getSkills(symbol) {
  return withFallback(() => liveSkills(symbol), () => readCache(symbol));
}
