export default function StatBar({ stats }) {
  if (!stats) return null;
  const items = [
    { k: "Total PnL", v: `${stats.totalPnl >= 0 ? "+" : ""}$${stats.totalPnl}`, tone: stats.totalPnl >= 0 ? "var(--green)" : "var(--red)" },
    { k: "Win Rate", v: `${stats.winRate}%` },
    { k: "Sharpe", v: stats.sharpe },
    { k: "Max Drawdown", v: `${stats.maxDrawdown}%`, tone: "var(--amber)" },
    { k: "Trades", v: stats.trades },
    { k: "Rejected", v: stats.rejected, tone: "var(--red)" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, background: "var(--line)", border: "1px solid var(--line)" }}>
      {items.map((it) => (
        <div key={it.k} className="ticks" style={{ position: "relative", background: "var(--panel)", padding: "14px 14px" }}>
          <div className="kicker">{it.k}</div>
          <div className="num" style={{ fontSize: 22, marginTop: 6, color: it.tone || "var(--text)" }}>{it.v}</div>
        </div>
      ))}
    </div>
  );
}
