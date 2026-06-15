import { useEffect, useState } from "react";
import { getStats, getTrades, getDecisions, getPortfolioHistory } from "../api/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import StatBar from "../components/StatBar";

export default function TradeLog() {
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [curve, setCurve] = useState([]);
  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getTrades().then(setTrades).catch(() => {});
    getDecisions().then(setDecisions).catch(() => {});
    getPortfolioHistory().then((h) => setCurve(h.map((p) => ({ t: new Date(p.createdAt).toLocaleDateString(), eq: p.equity })))).catch(() => {});
  }, []);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <StatBar stats={stats} />
      <div className="panel">
        <div style={{ color: "var(--muted)" }}>Equity Curve</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={curve}><XAxis dataKey="t" hide /><YAxis domain={["auto", "auto"]} /><Tooltip /><Line dataKey="eq" stroke="var(--green)" dot={false} /></LineChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <div style={{ color: "var(--muted)" }}>Decisions (incl. rejections)</div>
        <table>
          <thead><tr><th>Symbol</th><th>Verdict</th><th>Score</th><th>Risk</th><th>Vetoes</th></tr></thead>
          <tbody>
            {decisions.slice(0, 50).map((d) => (
              <tr key={d.id}>
                <td>{d.symbol}</td>
                <td className={d.verdict === "REJECT" ? "red" : d.verdict === "MODIFY" ? "amber" : "green"}>{d.verdict}</td>
                <td className="num">{d.tradeScore}</td>
                <td>{d.riskLevel}</td>
                <td className="amber">{(d.vetoes || []).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="panel">
        <div style={{ color: "var(--muted)" }}>Trades (agent + monitor)</div>
        <table>
          <thead><tr><th>Action</th><th>Price</th><th>Size</th><th>Reason</th><th>Source</th></tr></thead>
          <tbody>
            {trades.slice(0, 50).map((t) => (
              <tr key={t.id}>
                <td>{t.action}</td>
                <td className="num">{t.price}</td>
                <td className="num">{t.size}</td>
                <td>{t.reason}</td>
                <td className={t.source === "monitor" ? "amber" : ""}>{t.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
