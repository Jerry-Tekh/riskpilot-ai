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
      style={{ display: "block", filter: "drop-shadow(0 2px 5px rgba(60,48,28,.18))" }}
    />
  );
}
