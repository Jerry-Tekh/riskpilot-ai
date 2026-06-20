import { motion } from "motion/react";
import CountUp from "./CountUp";

export default function StatBar({ stats }) {
  if (!stats) return null;
  const items = [
    { k: "Total PnL", v: stats.totalPnl, dec: 2, prefix: stats.totalPnl >= 0 ? "+$" : "-$", abs: true, tone: stats.totalPnl >= 0 ? "var(--green)" : "var(--red)" },
    { k: "Win Rate", v: stats.winRate, dec: 0, suffix: "%" },
    { k: "Sharpe", v: stats.sharpe, dec: 2 },
    { k: "Max Drawdown", v: stats.maxDrawdown, dec: 2, suffix: "%", tone: "var(--amber)" },
    { k: "Trades", v: stats.trades, dec: 0 },
    { k: "Rejected", v: stats.rejected, dec: 0, tone: "var(--red)" },
  ];
  return (
    <div className="cards cards-6">
      {items.map((it, idx) => (
        <motion.div key={it.k} className="panel"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.45 }}
          whileHover={{ y: -3, boxShadow: "var(--shadow)" }}
          style={{ padding: "14px 16px" }}>
          <div className="kicker">{it.k}</div>
          <div className="num" style={{ fontSize: 23, marginTop: 6, color: it.tone || "var(--text)", fontWeight: 600 }}>
            <CountUp value={it.abs ? Math.abs(it.v) : it.v} decimals={it.dec} prefix={it.prefix || ""} suffix={it.suffix || ""} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
