import { useEffect, useState } from "react";
import { getMarket } from "../api/client";
import SignalGauge from "../components/SignalGauge";
import AdapterBadge from "../components/AdapterBadge";
import CoinIcon from "../components/CoinIcon";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "DOGEUSDT"];

export default function MarketIntel() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [ctx, setCtx] = useState(null);
  useEffect(() => { setCtx(null); getMarket(symbol).then(setCtx).catch(() => setCtx(null)); }, [symbol]);

  const SIG = ctx && [
    ["Trend", ctx.trend], ["Momentum", ctx.momentum], ["Volatility", ctx.volatility],
    ["Sentiment", ctx.sentiment], ["Funding", ctx.funding], ["News", ctx.newsImpact],
  ];

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="panel rise" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {SYMBOLS.map((s) => (
          <button key={s} className={`ghost ${s === symbol ? "active" : ""}`} onClick={() => setSymbol(s)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <CoinIcon symbol={s} size={18} /> {s.replace("USDT", "")}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          {ctx && <span className="num" style={{ fontSize: 18 }}>${(ctx.price < 1 ? ctx.price.toFixed(5) : ctx.price.toLocaleString())}</span>}
          {ctx && <AdapterBadge source={ctx.dataSource} />}
        </div>
      </div>

      {!ctx ? <div className="panel" style={{ color: "var(--muted)" }}>Loading market context…</div> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }} className="rise">
            {SIG.map(([label, s]) => <SignalGauge key={label} label={label} value={s.score} hint={s.label} />)}
          </div>
          <div className="panel ticks rise">
            <div className="panel--head"><span className="kicker">News Briefing</span><CoinIcon symbol={symbol} size={20} /></div>
            {(ctx.headlines || []).length === 0 && <div className="muted">No headlines.</div>}
            {(ctx.headlines || []).map((h, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--line)" }}>
                <span className="brand">▹</span><span style={{ color: "var(--text-dim)" }}>{h}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
