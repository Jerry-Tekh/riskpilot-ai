// Pure technical-analysis indicators computed from a series of closing prices.
// Used to make RiskPilot's perception genuinely analyst-grade from real Bitget candles.

export function sma(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export function ema(values, period) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  // seed with SMA of first `period` values, then iterate
  let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}

export function rsi(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  // initial average over first `period` changes
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gains += d; else losses -= d;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  // Wilder smoothing for the rest
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return +(100 - 100 / (1 + rs)).toFixed(2);
}

// MACD(12,26,9): returns { macd, signal, hist }
export function macd(closes, fast = 12, slow = 26, signalPeriod = 9) {
  if (closes.length < slow + signalPeriod) return null;
  // build MACD line series to compute its signal EMA
  const macdSeries = [];
  for (let i = slow; i <= closes.length; i++) {
    const sub = closes.slice(0, i);
    const ef = ema(sub, fast);
    const es = ema(sub, slow);
    if (ef != null && es != null) macdSeries.push(ef - es);
  }
  const macdLine = macdSeries[macdSeries.length - 1];
  const signal = ema(macdSeries, signalPeriod);
  if (signal == null) return null;
  return { macd: +macdLine.toFixed(4), signal: +signal.toFixed(4), hist: +(macdLine - signal).toFixed(4) };
}

// Realized daily volatility (stddev of daily returns) as a fraction.
export function realizedVol(closes) {
  if (closes.length < 2) return 0;
  const rets = [];
  for (let i = 1; i < closes.length; i++) rets.push(closes[i] / closes[i - 1] - 1);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  return Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length);
}
