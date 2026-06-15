import { getSkills } from "./adapters/skillHub.js";
import { placeSimOrder } from "./adapters/agentHub.js";
import { narrate } from "./adapters/qwen.js";
import { scoreTrade } from "./engines/scoring.js";
import { assessRisk } from "./engines/risk.js";
import { openPosition } from "./engines/simBroker.js";

export async function buildContext(symbol) {
  const s = await getSkills(symbol);
  return {
    symbol,
    trend: s.trend, momentum: s.momentum, volatility: s.volatility,
    sentiment: s.sentiment, funding: s.funding, newsImpact: s.newsImpact,
    price: s.price, atr: s.atr,
    dataSource: s.dataSource,
    headlines: s.newsImpact?.headlines || [],
  };
}

export async function decide(ctx, portfolio, intent) {
  const decision = scoreTrade(ctx);
  const risk = assessRisk({ ctx, decision, portfolio });
  const reasoning = await narrate({ symbol: ctx.symbol, decision, risk });
  return { ...decision, ...risk, intent, reasoning, marketContext: ctx };
}

export function parseSymbol(command) {
  const c = command.toUpperCase();
  if (c.includes("ETH")) return "ETHUSDT";
  if (c.includes("DOGE")) return "DOGEUSDT";
  return "BTCUSDT";
}

// Full loop with persistence; prisma injected for testability.
export async function runLoop({ command, prisma, getPortfolioState }) {
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
