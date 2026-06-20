import { useEffect, useState } from "react";
import { getMarket } from "../api/client";
import SignalGauge from "../components/SignalGauge";
import AdapterBadge from "../components/AdapterBadge";
import CoinIcon from "../components/CoinIcon";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "DOGEUSDT"];

function Indicators({ ind, price }) {
  const rsiTone = ind.rsi == null ? "var(--muted)" : ind.rsi >= 70 ? "var(--red)" : ind.rsi <= 30 ? "var(--green)" : "var(--text)";
  const rsiNote = ind.rsi == null ? "—" : ind.rsi >= 70 ? "Overbought" : ind.rsi <= 30 ? "Oversold" : "Neutral";
  const macdBull = ind.macd && ind.macd.hist > 0;
  const cross = ind.sma20 != null && ind.sma50 != null ? (ind.sma20 > ind.sma50 ? "Golden (20>50)" : "Death (20<50)") : "—";
  const crossTone = ind.sma20 != null && ind.sma50 != null ? (ind.sma20 > ind.sma50 ? "var(--green)" : "var(--red)") : "var(--muted)";
  const cell = (label, value, tone, note) => (
    <div className="ticks" style={{ position: "relative", background: "var(--panel)", padding: "13px 15px" }}>
      <div className="kicker">{label}</div>
      <div className="num" style={{ fontSize: 19, marginTop: 5, color: tone || "var(--text)" }}>{value}</div>
      {note && <div className="kicker dim" style={{ marginTop: 3 }}>{note}</div>}
    </div>
  );
  return (
    <div className="rise">
      <div className="kicker" style={{ margin: "2px 2px 8px" }}>Technical Analysis · computed from Bitget candles</div>
      <div className="cards cards-4 seam">
        {cell("RSI (14)", ind.rsi ?? "—", rsiTone, rsiNote)}
        {cell("MACD Hist", ind.macd ? ind.macd.hist : "—", macdBull ? "var(--green)" : "var(--red)", ind.macd ? (macdBull ? "Bullish" : "Bearish") : "—")}
        {cell("SMA 20 / 50", cross, crossTone, ind.sma20 != null ? `${ind.sma20} / ${ind.sma50 ?? "—"}` : "—")}
        {cell("Realized Vol", `${ind.realizedVolPct}%`, "var(--amber)", "daily")}
      </div>
    </div>
  );
}

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
          <div className="cards cards-3 rise">
            {SIG.map(([label, s]) => <SignalGauge key={label} label={label} value={s.score} hint={s.label} />)}
          </div>
          {ctx.indicators && <Indicators ind={ctx.indicators} price={ctx.price} />}
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
