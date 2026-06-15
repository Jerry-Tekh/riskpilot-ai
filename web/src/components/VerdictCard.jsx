export default function VerdictCard({ result }) {
  if (!result) return null;
  const color = result.verdict === "REJECT" ? "var(--red)" : result.verdict === "MODIFY" ? "var(--amber)" : "var(--green)";
  return (
    <div className="panel" style={{ borderColor: color }}>
      <div style={{ color, fontSize: 22 }}>{result.verdict} · {result.direction} {result.symbol || result.marketContext?.symbol}</div>
      <div className="num">Score {result.tradeScore} · Conf {result.confidence} · Risk {result.riskLevel}</div>
      {result.verdict !== "REJECT" && <div className="num">SL {result.stopLoss} · TP {result.takeProfit} · R:R {result.rewardRiskRatio} · Size {result.maxPositionSize}</div>}
      {result.vetoes?.length > 0 && <div className="amber">Vetoes: {result.vetoes.join(", ")}</div>}
      <p style={{ color: "var(--muted)" }}>{result.reasoning}</p>
    </div>
  );
}
