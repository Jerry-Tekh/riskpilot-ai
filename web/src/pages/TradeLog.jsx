import { useEffect, useState } from "react";
import { getStats, getTrades, getDecisions, getPortfolioHistory } from "../api/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import StatBar from "../components/StatBar";
import CoinIcon from "../components/CoinIcon";
import { api } from "../api/client";

const TT = { background: "var(--panel-2)", border: "1px solid var(--line-bright)", fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)" };
const vColor = (v) => (v === "REJECT" ? "var(--red)" : v === "MODIFY" ? "var(--amber)" : "var(--green)");

export default function TradeLog() {
  const [stats, setStats] = useState(null);
  const [trades, setTrades] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [curve, setCurve] = useState([]);
  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getTrades().then(setTrades).catch(() => {});
    getDecisions().then(setDecisions).catch(() => {});
    getPortfolioHistory().then((h) => setCurve(h.map((p) => ({ t: new Date(p.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }), eq: +p.equity.toFixed(2) })))).catch(() => {});
  }, []);

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="rise" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="kicker">Verifiable Evidence · 90-day simulated record</span>
        <a href={`${api.defaults.baseURL}/api/trades/export.csv`} target="_blank" rel="noreferrer">
          <button className="ghost" style={{ fontSize: 11 }}>⭳ Export trade log (CSV)</button>
        </a>
      </div>
      <div className="rise"><StatBar stats={stats} /></div>

      <div className="panel ticks rise">
        <div className="panel--head"><span className="kicker">Equity Curve · Backtest</span><span className="kicker dim">90-day simulated</span></div>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={curve} margin={{ left: -12, right: 6, top: 6 }}>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }} interval={12} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TT} cursor={{ stroke: "var(--line-bright)" }} />
            <Line dataKey="eq" stroke="var(--brand)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="row" style={{ alignItems: "stretch" }}>
        <div className="panel ticks rise" style={{ flex: 1, minWidth: 0 }}>
          <div className="panel--head"><span className="kicker">Decision Log</span><span className="kicker dim">incl. rejections</span></div>
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            <table>
              <thead><tr><th>Asset</th><th>Verdict</th><th>Score</th><th>Risk</th><th>Vetoes</th></tr></thead>
              <tbody>
                {decisions.slice(0, 60).map((d) => (
                  <tr key={d.id}>
                    <td style={{ display: "flex", alignItems: "center", gap: 7 }}><CoinIcon symbol={d.symbol} size={16} />{d.symbol.replace("USDT", "")}</td>
                    <td style={{ color: vColor(d.verdict), fontFamily: "var(--display)", fontSize: 11 }}>{d.verdict}</td>
                    <td className="num">{d.tradeScore}</td>
                    <td className="dim">{d.riskLevel}</td>
                    <td className="amber" style={{ fontSize: 11 }}>{(d.vetoes || []).join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel ticks rise" style={{ flex: 1, minWidth: 0 }}>
          <div className="panel--head"><span className="kicker">Execution Log</span><span className="kicker dim">agent + autonomous monitor</span></div>
          <div style={{ maxHeight: 420, overflow: "auto" }}>
            <table>
              <thead><tr><th>Action</th><th>Price</th><th>Size</th><th>Reason</th><th>Source</th></tr></thead>
              <tbody>
                {trades.slice(0, 60).map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: t.action === "CLOSE" ? "var(--text-dim)" : "var(--text)" }}>{t.action}</td>
                    <td className="num">{fmt(t.price)}</td>
                    <td className="num">{t.size}</td>
                    <td style={{ fontSize: 11, color: "var(--text-dim)" }}>{t.reason}</td>
                    <td>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, padding: "2px 7px", textTransform: "uppercase", letterSpacing: ".06em",
                        color: t.source === "monitor" ? "var(--amber)" : "var(--brand)",
                        border: `1px solid ${t.source === "monitor" ? "rgba(255,178,36,.4)" : "rgba(47,227,198,.4)"}` }}>
                        {t.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
const fmt = (n) => (n == null ? "—" : n < 1 ? n.toFixed(5) : n.toLocaleString(undefined, { maximumFractionDigits: 2 }));
