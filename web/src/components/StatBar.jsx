export default function StatBar({ stats }) {
  if (!stats) return null;
  const items = [["PnL", stats.totalPnl], ["Win %", stats.winRate], ["Sharpe", stats.sharpe], ["Max DD %", stats.maxDrawdown], ["Trades", stats.trades], ["Rejected", stats.rejected]];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {items.map(([k, v]) => (
        <div key={k} className="panel" style={{ flex: 1 }}>
          <div style={{ color: "var(--muted)" }}>{k}</div>
          <div className="num" style={{ fontSize: 20 }}>{v}</div>
        </div>
      ))}
    </div>
  );
}
