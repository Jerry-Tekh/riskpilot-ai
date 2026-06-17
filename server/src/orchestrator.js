import { getSkills } from "./adapters/skillHub.js";
import { placeSimOrder } from "./adapters/agentHub.js";
import { narrate, narrateTemplate, deepAnalyze } from "./adapters/qwen.js";
import { scoreTrade } from "./engines/scoring.js";
import { assessRisk } from "./engines/risk.js";
import { openPosition } from "./engines/simBroker.js";
import { recordLoop, recordSource } from "./metrics.js";
import { applyScenario } from "./engines/scenarios.js";
import { recordActivity } from "./activity.js";

export async function buildContext(symbol) {
  const s = await getSkills(symbol);
  recordSource(s.dataSource);
  return {
    symbol,
    trend: s.trend, momentum: s.momentum, volatility: s.volatility,
    sentiment: s.sentiment, funding: s.funding, newsImpact: s.newsImpact,
    price: s.price, atr: s.atr,
    indicators: s.indicators || null,
    dataSource: s.dataSource,
    headlines: s.newsImpact?.headlines || [],
  };
}

export async function decide(ctx, portfolio, intent, { quiet = false } = {}) {
  const decision = scoreTrade(ctx);
  const risk = assessRisk({ ctx, decision, portfolio });
  const payload = {
    symbol: ctx.symbol, decision, risk,
    market: {
      trend: ctx.trend, momentum: ctx.momentum, volatility: ctx.volatility,
      sentiment: ctx.sentiment, funding: ctx.funding, newsImpact: ctx.newsImpact,
      indicators: ctx.indicators || undefined, dataSource: ctx.dataSource,
    },
  };
  const reasoning = quiet ? narrateTemplate(payload) : await narrate(payload);
  return { ...decision, ...risk, intent, reasoning, marketContext: ctx };
}

// Stress test: apply a scenario override and return the risk engine's response. No persistence.
export async function stressTest(symbol, scenario, basePortfolio) {
  const liveCtx = await buildContext(symbol);
  const { ctx, portfolio } = applyScenario(liveCtx, basePortfolio, scenario);
  const result = await decide(ctx, portfolio, `Stress: ${scenario}`);
  return { ...result, symbol, scenario };
}

// On-demand deep-reasoning analysis for a symbol (does not execute or persist).
export async function deepAnalysis(symbol, portfolio) {
  const ctx = await buildContext(symbol);
  const decision = scoreTrade(ctx);
  const risk = assessRisk({ ctx, decision, portfolio });
  const result = await deepAnalyze({
    symbol, decision, risk,
    market: {
      trend: ctx.trend, momentum: ctx.momentum, volatility: ctx.volatility,
      sentiment: ctx.sentiment, funding: ctx.funding, newsImpact: ctx.newsImpact,
      indicators: ctx.indicators || undefined, dataSource: ctx.dataSource,
    },
  });
  return { symbol, verdict: risk.verdict, dataSource: ctx.dataSource, ...result };
}

export function parseSymbol(command) {
  const c = command.toUpperCase();
  if (c.includes("ETH")) return "ETHUSDT";
  if (c.includes("DOGE")) return "DOGEUSDT";
  return "BTCUSDT";
}

// Full loop with persistence; prisma injected for testability.
export async function runLoop({ command, prisma, getPortfolioState, quiet = false }) {
  recordLoop();
  const symbol = parseSymbol(command);
  const ctx = await buildContext(symbol);
  const portfolio = await getPortfolioState();
  const result = await decide(ctx, portfolio, command, { quiet });
  const dirPart = result.direction === "HOLD" ? "" : ` ${result.direction}`;
  recordActivity(
    result.verdict === "REJECT" ? "reject" : "decision",
    `${result.verdict}${dirPart} ${symbol.replace("USDT", "")} · score ${result.tradeScore}${result.vetoes.length ? " · " + result.vetoes.join(",") : ""}`,
    { symbol, verdict: result.verdict, source: ctx.dataSource }
  );

  const decisionRow = await prisma.decision.create({
    data: {
      symbol, intent: command, direction: result.direction, tradeScore: result.tradeScore,
      confidence: result.confidence, riskLevel: result.riskLevel, verdict: result.verdict,
      vetoes: result.vetoes, reasoning: result.reasoning, marketContext: ctx,
    },
  });

  let position = null;
  if ((result.verdict === "APPROVE" || result.verdict === "MODIFY") && result.maxPositionSize > 0) {
    await placeSimOrder({ symbol, side: result.direction, size: result.maxPositionSize, price: ctx.price });
    const p = openPosition({
      symbol, side: result.direction, entryPrice: ctx.price, size: result.maxPositionSize,
      stopLoss: result.stopLoss, takeProfit: result.takeProfit,
    });
    position = await prisma.position.create({ data: { ...p, decisionId: decisionRow.id, openedAt: new Date() } });
    await prisma.trade.create({
      data: { positionId: position.id, action: "OPEN", price: ctx.price, size: result.maxPositionSize, reason: "agent open", source: "agent" },
    });
    recordActivity("execute", `Opened ${result.direction} ${symbol.replace("USDT", "")} @ ${ctx.price} · size ${result.maxPositionSize}`, { symbol });
  }

  return { decision: decisionRow, position, result };
}
