// Maps a trading symbol (e.g. BTCUSDT) to its locally-served coin logo.
const MAP = { BTCUSDT: "btc", ETHUSDT: "eth", DOGEUSDT: "doge" };

export default function CoinIcon({ symbol, size = 22 }) {
  const slug = MAP[symbol] || "btc";
  return (
    <img
      src={`/coins/${slug}.svg`}
      width={size}
      height={size}
      alt={symbol}
      style={{ display: "block", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}
    />
  );
}
