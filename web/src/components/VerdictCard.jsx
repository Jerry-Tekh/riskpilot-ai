import { motion } from "motion/react";
import { CheckCircle2, AlertTriangle, XCircle, PauseCircle, Bot } from "lucide-react";
import CoinIcon from "./CoinIcon";

const ICON = { APPROVE: CheckCircle2, MODIFY: AlertTriangle, REJECT: XCircle, HOLD: PauseCircle };

const VETO_LABELS = {
  score_floor: "Score below floor",
  poor_reward_risk: "Poor reward:risk",
  extreme_volatility: "Extreme volatility",
  drawdown_breach: "Drawdown breach",
  news_blackout: "News blackout",
  crowded_funding: "Crowded funding",
  concentration: "Portfolio concentration",
};

const TINT = {
  REJECT: { c: "var(--red)", soft: "var(--red-soft)" },
  MODIFY: { c: "var(--amber)", soft: "var(--amber-soft)" },
  HOLD: { c: "var(--blue)", soft: "#e2ecf6" },
  APPROVE: { c: "var(--green)", soft: "var(--green-soft)" },
};

export default function VerdictCard({ result }) {
  if (!result) return null;
  const symbol = result.symbol || result.marketContext?.symbol;
  const v = result.verdict;
  const t = TINT[v] || TINT.APPROVE;
  const noTrade = v === "REJECT" || v === "HOLD";
  const longShort = result.direction === "SELL" ? "var(--red)" : result.direction === "HOLD" ? "var(--text-dim)" : "var(--green)";

  return (
    <motion.div className="panel"
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      style={{ borderColor: t.c, borderWidth: 1, background: `linear-gradient(180deg, ${t.soft}, var(--panel) 46%)`, boxShadow: "var(--shadow)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <CoinIcon symbol={symbol} size={42} />
          <div>
            <div className="kicker">Verdict</div>
            <div className="display" style={{ fontSize: 32, color: t.c, lineHeight: 1.05, display: "flex", alignItems: "center", gap: 9 }}>
              {ICON[v] && (() => { const I = ICON[v]; return <I size={28} strokeWidth={2.2} />; })()}{v}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="kicker">Action</div>
          <div className="display" style={{ fontSize: 21, color: longShort }}>
            {result.direction} <span style={{ color: "var(--text)" }}>{symbol}</span>
          </div>
        </div>
      </div>

      <div className="cards cards-4" style={{ marginTop: 16 }}>
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
              <span key={vt} className="pill" style={{ color: "var(--amber)", background: "var(--amber-soft)", border: "1px solid #ecdcb0" }}><AlertTriangle size={13} /> {VETO_LABELS[vt] || vt}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 14, color: "var(--text-dim)", fontSize: 14, lineHeight: 1.65, borderTop: "1px solid var(--line)", paddingTop: 12, display: "flex", gap: 10 }}>
        <Bot size={18} style={{ color: "var(--brand)", flex: "none", marginTop: 2 }} />
        <p style={{ margin: 0 }}>{result.reasoning}</p>
      </div>
    </motion.div>
  );
}

function Metric({ label, value, accent, tone }) {
  return (
    <div style={{ background: "var(--panel-2)", padding: "12px 14px", borderRadius: "var(--r-sm)", border: "1px solid var(--line)" }}>
      <div className="kicker">{label}</div>
      <div className="num" style={{ fontSize: accent ? 26 : 16, marginTop: 4, color: tone || (accent ? "var(--brand)" : "var(--text)"), fontWeight: accent ? 600 : 500 }}>{value}</div>
    </div>
  );
}

function fmt(n) {
  if (n == null) return "—";
  return n < 1 ? n.toFixed(5) : n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
