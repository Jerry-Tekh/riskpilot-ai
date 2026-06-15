import { useEffect, useState } from "react";
import { getPortfolio, getPositions, getPortfolioHistory } from "../api/client";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function RiskCenter() {
  const [summary, setSummary] = useState(null);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    getPortfolio().then(setSummary).catch(() => {});
    getPositions("open").then(setPositions).catch(() => {});
    getPortfolioHistory().then((h) => setHistory(h.map((p) => ({ t: new Date(p.createdAt).toLocaleDateString(), dd: +(p.drawdown * 100).toFixed(2), eq: p.equity })))).catch(() => {});
  }, []);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {summary && (
        <div style={{ display: "flex", gap: 8 }}>
          <div className="panel" style={{ flex: 1 }}><div style={{ color: "var(--muted)" }}>Risk Score</div><div className="num" style={{ fontSize: 28 }}>{summary.riskScore}</div></div>
          <div className="panel" style={{ flex: 1 }}><div style={{ color: "var(--muted)" }}>Exposure</div><div className="num" style={{ fontSize: 28 }}>${summary.exposure.toFixed(0)}</div></div>
          <div className="panel" style={{ flex: 1 }}><div style={{ color: "var(--muted)" }}>Drawdown</div><div className="num" style={{ fontSize: 28 }}>{(summary.drawdown * 100).toFixed(1)}%</div></div>
        </div>
      )}
      <div className="panel">
        <div style={{ color: "var(--muted)" }}>Drawdown %</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}><XAxis dataKey="t" hide /><YAxis /><Tooltip /><Area dataKey="dd" stroke="var(--red)" fill="#3a1414" /></AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="panel">
        <div style={{ color: "var(--muted)" }}>Open Positions</div>
        <table>
          <thead><tr><th>Symbol</th><th>Side</th><th>Entry</th><th>Size</th><th>SL</th><th>TP</th></tr></thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id}>
                <td>{p.symbol}</td>
                <td className={p.side === "BUY" ? "green" : "red"}>{p.side}</td>
                <td className="num">{p.entryPrice}</td>
                <td className="num">{p.size}</td>
                <td className="num">{p.stopLoss}</td>
                <td className="num">{p.takeProfit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
