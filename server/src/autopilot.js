// Autonomous mode: the agent runs the full loop across symbols on an interval,
// with no human input. Deterministic (quiet = no Qwen) so it costs zero LLM tokens.
// Auto-expires to prevent runaway usage on the shared demo deployment.
import { runLoop } from "./orchestrator.js";
import { recordActivity } from "./activity.js";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "DOGEUSDT"];
const TICK_MS = 12000;     // one symbol every 12s
const MAX_TICKS = 60;      // ~12 min then auto-disengage

const state = { enabled: false, ticks: 0, startedAt: null, cursor: 0 };
let timer = null;
let deps = null; // { prisma, getPortfolioState }

export function configureAutopilot(d) { deps = d; }

async function tick() {
  if (!state.enabled || !deps) return;
  if (state.ticks >= MAX_TICKS) return stop("auto-expired (tick limit reached)");
  const symbol = SYMBOLS[state.cursor % SYMBOLS.length];
  state.cursor++; state.ticks++;
  try {
    await runLoop({ command: `Trade ${symbol}`, prisma: deps.prisma, getPortfolioState: deps.getPortfolioState, quiet: true });
  } catch (e) {
    recordActivity("risk", `Autopilot tick error: ${e.message}`, { symbol });
  }
}

export function start() {
  if (state.enabled) return status();
  state.enabled = true; state.ticks = 0; state.startedAt = Date.now();
  recordActivity("autopilot", "Autopilot ENGAGED — agent now trading autonomously across BTC · ETH · DOGE", {});
  tick(); // immediate first action
  timer = setInterval(tick, TICK_MS);
  return status();
}

export function stop(reason = "disengaged by operator") {
  if (timer) { clearInterval(timer); timer = null; }
  if (state.enabled) recordActivity("autopilot", `Autopilot DISENGAGED — ${reason}`, {});
  state.enabled = false;
  return status();
}

export function status() {
  return {
    enabled: state.enabled,
    ticks: state.ticks,
    maxTicks: MAX_TICKS,
    tickMs: TICK_MS,
    symbols: SYMBOLS,
    uptimeSec: state.startedAt && state.enabled ? Math.round((Date.now() - state.startedAt) / 1000) : 0,
  };
}
