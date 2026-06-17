import { useEffect, useState } from "react";
import { getPortfolio, getPositions, getPortfolioHistory } from "../api/client";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import CoinIcon from "../components/CoinIcon";
import StressTest from "../components/StressTest";

const TT = { background: "var(--panel-2)", border: "1px solid var(--line-bright)", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" };

export default function RiskCenter() {
  const [summary, setSummary] = useState(null);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    getPortfolio().then(setSummary).catch(() => {});
    getPositions("open").then(setPositions).catch(() => {});
    getPortfolioHistory().then((h) => setHistory(h.map((p) => ({ t: new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }), dd: +(p.drawdown * 100).toFixed(2) })))).catch(() => {});
  }, []);

  const riskColor = !summary ? "var(--muted)" : summary.riskScore >= 70 ? "var(--red)" : summary.riskScore >= 45 ? "var(--amber)" : "var(--green)";

  return (
    <div className="grid" style={{ gap: 14 }}>
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }} className="rise">
          <Tile label="Portfolio Risk Score" value={summary.riskScore} tone={riskColor} big />
          <Tile label="Total Exposure" value={`$${summary.exposure.toFixed(0)}`} sub={`${Math.round(summary.exposure / (summary.equity || 1) * 100)}% of equity`} />
          <Tile label="Drawdown" value={`${(summary.drawdown * 100).toFixed(2)}%`} tone="var(--amber)" sub={`equity $${summary.equity.toFixed(0)}`} />
        </div>
      )}

      <div className="panel ticks rise">
        <div className="panel--head"><span className="kicker">Drawdown Curve</span><span className="kicker dim">90-day</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history} margin={{ left: -18, right: 6, top: 6 }}>
            <defs><linearGradient id="dd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--red)" stopOpacity=".5" /><stop offset="100%" stopColor="var(--red)" stopOpacity="0" /></linearGradient></defs>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }} interval={12} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TT} cursor={{ stroke: "var(--line-bright)" }} />
            <Area dataKey="dd" stroke="var(--red)" strokeWidth={2} fill="url(#dd)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <StressTest />

      <div className="panel ticks rise">
        <div className="panel--head"><span className="kicker">Open Positions</span><span className="kicker dim">{positions.length} active</span></div>
        <table>
          <thead><tr><th>Asset</th><th>Side</th><th>Entry</th><th>Size</th><th>Stop</th><th>Target</th></tr></thead>
          <tbody>
            {positions.length === 0 && <tr><td colSpan={6} className="muted" style={{ padding: 20, textAlign: "center" }}>No open positions.</td></tr>}
            {positions.map((p) => (
              <tr key={p.id}>
                <td style={{ display: "flex", alignItems: "center", gap: 8 }}><CoinIcon symbol={p.symbol} size={18} />{p.symbol.replace("USDT", "")}</td>
                <td className={p.side === "BUY" ? "green" : "red"}>{p.side}</td>
                <td className="num">{fmt(p.entryPrice)}</td>
                <td className="num">{p.size}</td>
                <td className="num red">{fmt(p.stopLoss)}</td>
                <td className="num green">{fmt(p.takeProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ label, value, sub, tone, big }) {
  return (
    <div className="ticks" style={{ position: "relative", background: "var(--panel)", padding: "16px 18px" }}>
      <div className="kicker">{label}</div>
      <div className="num" style={{ fontSize: big ? 38 : 26, marginTop: 6, color: tone || "var(--text)" }}>{value}</div>
      {sub && <div className="kicker dim" style={{ marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
const fmt = (n) => (n == null ? "—" : n < 1 ? n.toFixed(5) : n.toLocaleString(undefined, { maximumFractionDigits: 2 }));
