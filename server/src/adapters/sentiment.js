// Live market sentiment via the Crypto Fear & Greed Index (alternative.me, free, no key).
// Market-wide index (0 = extreme fear, 100 = extreme greed) → maps directly to a sentiment score.

const FNG = "https://api.alternative.me/fng/?limit=1";

export async function getFearGreed(timeoutMs = 3500) {
  const res = await Promise.race([
    fetch(FNG),
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
  ]);
  if (!res.ok) throw new Error(`fng ${res.status}`);
  const j = await res.json();
  const d = j.data?.[0];
  if (!d) throw new Error("fng empty");
  const score = Math.max(0, Math.min(100, Math.round(Number(d.value))));
  return { score, label: d.value_classification }; // e.g. { score: 22, label: "Extreme Fear" }
}
