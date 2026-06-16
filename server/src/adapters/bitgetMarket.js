// Live Bitget public market data → derived perception signals.
// Uses free public REST endpoints (no API key). All scores normalized to 0..100.

const BASE = "https://api.bitget.com";
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

async function fetchJson(url, timeoutMs = 4000) {
  const res = await Promise.race([
    fetch(url),
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
  ]);
  if (!res.ok) throw new Error(`bitget ${res.status}`);
  const json = await res.json();
  if (json.code && json.code !== "00000") throw new Error(`bitget ${json.code}: ${json.msg}`);
  return json.data;
}

// Candle row: [ts, open, high, low, close, baseVol, quoteVol, usdtVol], oldest→newest.
async function getCandles(symbol, limit = 30) {
  const rows = await fetchJson(`${BASE}/api/v2/spot/market/candles?symbol=${symbol}&granularity=1day&limit=${limit}`);
  return rows.map((r) => ({
    open: +r[1], high: +r[2], low: +r[3], close: +r[4],
  }));
}

async function getFundingRate(symbol) {
  try {
    const d = await fetchJson(`${BASE}/api/v2/mix/market/current-fund-rate?symbol=${symbol}&productType=usdt-futures`);
    return +d[0].fundingRate;
  } catch {
    return 0; // not all symbols have perp funding; treat as neutral
  }
}

export function deriveSignals(candles) {
  const closes = candles.map((c) => c.close);
  const price = closes[closes.length - 1];

  // ATR proxy: average daily range over last 14 candles
  const recent = candles.slice(-14);
  const atr = recent.reduce((a, c) => a + (c.high - c.low), 0) / recent.length;

  // Trend: last close vs simple moving average (price above/below mean)
  const sma = closes.reduce((a, b) => a + b, 0) / closes.length;
  const trendScore = clamp(Math.round(50 + (price / sma - 1) * 100 * 5));

  // Momentum: rate of change over last 10 days
  const past = closes[Math.max(0, closes.length - 11)];
  const roc = price / past - 1;
  const momentumScore = clamp(Math.round(50 + roc * 100 * 4));

  // Volatility: stddev of daily returns, normalized (≈2% daily → 36, ≈5%+ → extreme)
  const rets = [];
  for (let i = 1; i < closes.length; i++) rets.push(closes[i] / closes[i - 1] - 1);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length);
  const volatilityScore = clamp(Math.round(sd * 100 * 18));

  return { price: +price.toFixed(price < 1 ? 5 : 2), atr: +atr.toFixed(price < 1 ? 5 : 2), trendScore, momentumScore, volatilityScore };
}

export function fundingScore(rate) {
  // crowdedness 0..100 from |8h funding rate|; ~0.05%/8h reads as very crowded
  return clamp(Math.round((Math.abs(rate) / 0.0005) * 90));
}

function label(score, kind) {
  if (kind === "trend") return score >= 60 ? "Bullish" : score <= 40 ? "Bearish" : "Neutral";
  if (kind === "vol") return score >= 90 ? "Extreme" : score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";
  return score >= 66 ? "Strong" : score >= 40 ? "Moderate" : "Weak";
}

// Returns the market-derived portion of a MarketContext.
export async function getLiveMarket(symbol) {
  const [candles, funding] = await Promise.all([getCandles(symbol), getFundingRate(symbol)]);
  const s = deriveSignals(candles);
  const fScore = fundingScore(funding);
  return {
    trend: { label: label(s.trendScore, "trend"), score: s.trendScore },
    momentum: { label: label(s.momentumScore, "mom"), score: s.momentumScore },
    volatility: { label: label(s.volatilityScore, "vol"), score: s.volatilityScore },
    funding: { label: fScore >= 80 ? "Crowded" : fScore >= 40 ? "Elevated" : "Normal", score: fScore },
    price: s.price,
    atr: s.atr,
  };
}
