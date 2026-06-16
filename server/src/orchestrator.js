import { getSkills } from "./adapters/skillHub.js";
import { placeSimOrder } from "./adapters/agentHub.js";
import { narrate, deepAnalyze } from "./adapters/qwen.js";
import { scoreTrade } from "./engines/scoring.js";
import { assessRisk } from "./engines/risk.js";
import { openPosition } from "./engines/simBroker.js";
import { recordLoop, recordSource } from "./metrics.js";

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

export async function decide(ctx, portfolio, intent) {
  const decision = scoreTrade(ctx);
  const risk = assessRisk({ ctx, decision, portfolio });
  const reasoning = await narrate({
    symbol: ctx.symbol,
    decision,
    risk,
    market: {
      trend: ctx.trend, momentum: ctx.momentum, volatility: ctx.volatility,
      sentiment: ctx.sentiment, funding: ctx.funding, newsImpact: ctx.newsImpact,
      indicators: ctx.indicators || undefined,
      dataSource: ctx.dataSource,
    },
  });
  return { ...decision, ...risk, intent, reasoning, marketContext: ctx };
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
export async function runLoop({ command, prisma, getPortfolioState }) {
  recordLoop();
  const symbol = parseSymbol(command);
  const ctx = await buildContext(symbol);
  const portfolio = await getPortfolioState();
  const result = await decide(ctx, portfolio, command);

  const decisionRow = await prisma.decision.create({
    data: {
      symbol, intent: command, direction: result.direction, tradeScore: result.tradeScore,
      confidence: result.confidence, riskLevel: result.riskLevel, verdict: result.verdict,
      vetoes: result.vetoes, reasoning: result.reasoning, marketContext: ctx,
    },
  });

  let position = null;
  if (result.verdict !== "REJECT" && result.maxPositionSize > 0) {
    await placeSimOrder({ symbol, side: result.direction, size: result.maxPositionSize, price: ctx.price });
    const p = openPosition({
      symbol, side: result.direction, entryPrice: ctx.price, size: result.maxPositionSize,
      stopLoss: result.stopLoss, takeProfit: result.takeProfit,
    });
    position = await prisma.position.create({ data: { ...p, decisionId: decisionRow.id, openedAt: new Date() } });
    await prisma.trade.create({
      data: { positionId: position.id, action: "OPEN", price: ctx.price, size: result.maxPositionSize, reason: "agent open", source: "agent" },
    });
  }

  return { decision: decisionRow, position, result };
}
