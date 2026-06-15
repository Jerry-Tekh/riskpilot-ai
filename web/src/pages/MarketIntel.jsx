import { useEffect, useState } from "react";
import { getMarket } from "../api/client";
import SignalGauge from "../components/SignalGauge";
import AdapterBadge from "../components/AdapterBadge";

export default function MarketIntel() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [ctx, setCtx] = useState(null);
  useEffect(() => { setCtx(null); getMarket(symbol).then(setCtx).catch(() => setCtx(null)); }, [symbol]);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="panel">
        {["BTCUSDT", "ETHUSDT", "DOGEUSDT"].map((s) => (
          <button key={s} onClick={() => setSymbol(s)} style={{ marginRight: 8, background: s === symbol ? "var(--accent)" : "var(--line)", color: s === symbol ? "#001" : "var(--text)" }}>{s}</button>
        ))}
        {ctx && <span style={{ marginLeft: 12 }}><AdapterBadge source={ctx.dataSource} /></span>}
      </div>
      {!ctx ? <div className="panel">Loading…</div> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            <SignalGauge label="Trend" value={ctx.trend.score} />
            <SignalGauge label="Momentum" value={ctx.momentum.score} />
            <SignalGauge label="Volatility" value={ctx.volatility.score} />
            <SignalGauge label="Sentiment" value={ctx.sentiment.score} />
            <SignalGauge label="Funding" value={ctx.funding.score} />
            <SignalGauge label="News" value={ctx.newsImpact.score} />
          </div>
          <div className="panel">
            <div style={{ color: "var(--muted)" }}>Headlines</div>
            {(ctx.headlines || []).map((h, i) => <div key={i}>• {h}</div>)}
          </div>
        </>
      )}
    </div>
  );
}
