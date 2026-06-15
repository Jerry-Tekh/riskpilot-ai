export function computeStats(closedPositions, equityCurve = []) {
  const trades = closedPositions.length;
  const wins = closedPositions.filter((p) => (p.pnl ?? 0) > 0).length;
  const totalPnl = +closedPositions.reduce((a, p) => a + (p.pnl ?? 0), 0).toFixed(2);
  const winRate = trades ? Math.round((wins / trades) * 100) : 0;

  let peak = -Infinity, maxDrawdown = 0;
  for (const e of equityCurve) {
    if (e > peak) peak = e;
    if (peak > 0) maxDrawdown = Math.max(maxDrawdown, (peak - e) / peak);
  }

  const returns = [];
  for (let i = 1; i < equityCurve.length; i++) returns.push((equityCurve[i] - equityCurve[i - 1]) / equityCurve[i - 1]);
  const mean = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const sd = returns.length ? Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length) : 0;
  const sharpe = sd ? +((mean / sd) * Math.sqrt(365)).toFixed(2) : 0;

  return { trades, winRate, totalPnl, maxDrawdown: +(maxDrawdown * 100).toFixed(2), sharpe };
}
