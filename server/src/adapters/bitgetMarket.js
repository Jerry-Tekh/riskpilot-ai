// Live Bitget public market data → derived perception signals.
// Uses free public REST endpoints (no API key). All scores normalized to 0..100.

import { sma, rsi, macd, realizedVol } from "../engines/indicators.js";
import { recordBitgetCall } from "../metrics.js";

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
  recordBitgetCall();
  return json.data;
}

// Candle row: [ts, open, high, low, close, baseVol, quoteVol, usdtVol], oldest→newest.
async function getCandles(symbol, limit = 100) {
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

  // Real indicators
  const sma20 = sma(closes, 20);
  const sma50 = sma(closes, 50);
  const rsi14 = rsi(closes, 14);
  const macdVal = macd(closes);
  const sd = realizedVol(closes);

  // Trend: price vs SMA20, confirmed by SMA-cross and MACD histogram sign
  let trendScore = 50 + (sma20 ? (price / sma20 - 1) * 100 * 5 : 0);
  if (sma20 && sma50) trendScore += sma20 > sma50 ? 6 : -6;
  if (macdVal) trendScore += macdVal.hist > 0 ? 6 : -6;
  trendScore = clamp(Math.round(trendScore));

  // Momentum: RSI (already a 0..100 momentum oscillator); fallback to ROC
  let momentumScore;
  if (rsi14 != null) momentumScore = clamp(Math.round(rsi14));
  else {
    const past = closes[Math.max(0, closes.length - 11)];
    momentumScore = clamp(Math.round(50 + (price / past - 1) * 400));
  }

  // Volatility: realized daily vol normalized (≈2% daily → 36, ≈5%+ → extreme)
  const volatilityScore = clamp(Math.round(sd * 100 * 18));

  const dp = price < 1 ? 5 : 2;
  return {
    price: +price.toFixed(dp), atr: +atr.toFixed(dp),
    trendScore, momentumScore, volatilityScore,
    indicators: {
      rsi: rsi14,
      macd: macdVal,
      sma20: sma20 != null ? +sma20.toFixed(dp) : null,
      sma50: sma50 != null ? +sma50.toFixed(dp) : null,
      realizedVolPct: +(sd * 100).toFixed(2),
    },
  };
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
    indicators: s.indicators,
  };
}
