import CoinIcon from "./CoinIcon";

const VETO_LABELS = {
  score_floor: "Score below floor",
  poor_reward_risk: "Poor reward:risk",
  extreme_volatility: "Extreme volatility",
  drawdown_breach: "Drawdown breach",
  news_blackout: "News blackout",
  crowded_funding: "Crowded funding",
  concentration: "Portfolio concentration",
};

export default function VerdictCard({ result }) {
  if (!result) return null;
  const symbol = result.symbol || result.marketContext?.symbol;
  const v = result.verdict;
  const color = v === "REJECT" ? "var(--red)" : v === "MODIFY" ? "var(--amber)" : v === "HOLD" ? "var(--blue)" : "var(--green)";
  const noTrade = v === "REJECT" || v === "HOLD";
  const longShort = result.direction === "SELL" ? "var(--red)" : result.direction === "HOLD" ? "var(--text-dim)" : "var(--green)";

  return (
    <div className="panel ticks rise" style={{
      borderColor: color,
      boxShadow: `0 0 0 1px ${color}, 0 0 60px -20px ${color}, 0 18px 40px -32px rgba(0,0,0,.9)`,
      background: `linear-gradient(180deg, ${color}14, transparent 38%), var(--panel)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <CoinIcon symbol={symbol} size={40} />
          <div>
            <div className="kicker">Verdict</div>
            <div className="display" style={{ fontSize: 30, color, lineHeight: 1.05, letterSpacing: ".02em" }}>{v}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="kicker">Action</div>
          <div className="display" style={{ fontSize: 20, color: longShort }}>
            {result.direction} <span style={{ color: "var(--text)" }}>{symbol}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, marginTop: 16, background: "var(--line)", border: "1px solid var(--line)" }}>
        <Metric label="Trade Score" value={result.tradeScore} accent />
        <Metric label="Confidence" value={result.confidence} />
        <Metric label="Risk Level" value={result.riskLevel} />
        <Metric label="Reward : Risk" value={noTrade ? "—" : `${result.rewardRiskRatio}×`} />
        {!noTrade && <>
          <Metric label="Entry" value={fmt(result.marketContext?.price)} />
          <Metric label="Stop Loss" value={fmt(result.stopLoss)} tone="var(--red)" />
          <Metric label="Take Profit" value={fmt(result.takeProfit)} tone="var(--green)" />
          <Metric label="Size" value={result.maxPositionSize} />
        </>}
      </div>

      {result.vetoes?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>Risk Vetoes</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {result.vetoes.map((vt) => (
              <span key={vt} style={{
                fontFamily: "var(--mono)", fontSize: 11, padding: "4px 9px",
                color: "var(--amber)", border: "1px solid rgba(255,178,36,.4)", background: "rgba(255,178,36,.08)",
              }}>⚠ {VETO_LABELS[vt] || vt}</span>
            ))}
          </div>
        </div>
      )}

      <p style={{ marginTop: 14, marginBottom: 0, color: "var(--text-dim)", fontSize: 13.5, lineHeight: 1.6, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        <span className="kicker" style={{ marginRight: 8, color: "var(--brand)" }}>AGENT</span>{result.reasoning}
      </p>
    </div>
  );
}

function Metric({ label, value, accent, tone }) {
  return (
    <div style={{ background: "var(--panel-2)", padding: "11px 13px" }}>
      <div className="kicker">{label}</div>
      <div className="num" style={{ fontSize: accent ? 24 : 16, marginTop: 4, color: tone || (accent ? "var(--brand)" : "var(--text)") }}>{value}</div>
    </div>
  );
}

function fmt(n) {
  if (n == null) return "—";
  return n < 1 ? n.toFixed(5) : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
