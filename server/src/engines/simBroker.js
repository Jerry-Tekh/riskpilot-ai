export function openPosition({ symbol, side, entryPrice, size, stopLoss, takeProfit }) {
  return { symbol, side, entryPrice, size, stopLoss, takeProfit, status: "OPEN", openedAt: null };
}

export function computePnl(pos, price) {
  const dir = pos.side === "BUY" ? 1 : -1;
  return +(((price - pos.entryPrice) * dir) * pos.size).toFixed(6);
}

export function evaluatePosition(pos, price) {
  if (pos.status !== "OPEN") return { action: "HOLD" };
  const long = pos.side === "BUY";
  const hitStop = long ? price <= pos.stopLoss : price >= pos.stopLoss;
  const hitTarget = long ? price >= pos.takeProfit : price <= pos.takeProfit;
  if (hitStop) return { action: "CLOSE", reason: "auto-closed: stop-loss hit", exitPrice: price, pnl: computePnl(pos, price) };
  if (hitTarget) return { action: "CLOSE", reason: "auto-closed: take-profit hit", exitPrice: price, pnl: computePnl(pos, price) };
  return { action: "HOLD" };
}
