import { useState } from "react";
import { runLoop } from "../api/client";
import LoopSteps from "../components/LoopSteps";
import VerdictCard from "../components/VerdictCard";
import DeepAnalysis from "../components/DeepAnalysis";
import SignalGauge from "../components/SignalGauge";
import AdapterBadge from "../components/AdapterBadge";
import CoinIcon from "../components/CoinIcon";

const QUICK = [
  { sym: "BTCUSDT", cmd: "Trade BTC using current conditions" },
  { sym: "ETHUSDT", cmd: "Trade ETH using current conditions" },
  { sym: "DOGEUSDT", cmd: "Trade DOGE using current conditions" },
];

export default function Console() {
  const [command, setCommand] = useState("Trade BTC using current conditions");
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function run(cmd) {
    const c = cmd ?? command;
    setBusy(true); setResult(null); setError(null); setCtx(null); setActive(0);
    // Advance the first 3 stages while the request is in flight (the agent is "thinking").
    let step = 0;
    const timer = setInterval(() => { step = Math.min(step + 1, 2); setActive(step); }, 1100);
    try {
      const data = await runLoop(c);
      clearInterval(timer);
      const r = data.result; const mc = r.marketContext;
      setCtx(mc);
      setActive(3);
      await new Promise((res) => setTimeout(res, 500));
      setResult({ ...r, symbol: mc.symbol });
    } catch (e) {
      clearInterval(timer);
      setError(e?.response?.data?.error || e.message); setActive(-1);
    } finally { setBusy(false); }
  }

  const SIG = ctx && [
    ["Trend", ctx.trend], ["Momentum", ctx.momentum], ["Volatility", ctx.volatility],
    ["Sentiment", ctx.sentiment], ["Funding", ctx.funding], ["News", ctx.newsImpact],
  ];

  return (
    <div className="grid" style={{ gap: 14 }}>
      {/* command bar */}
      <div className="panel ticks rise" style={{ padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <span className="kicker">Agent Console</span>
          <span className="kicker dim">natural-language command → autonomous loop</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
          <span style={{ color: "var(--brand)", fontFamily: "var(--mono)" }}>❯</span>
          <input value={command} onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && run()}
            placeholder="e.g. Trade BTC using current conditions"
            style={{ flex: 1, fontSize: 15 }} />
          <button onClick={() => run()} disabled={busy}>{busy ? "Running…" : "Run Loop ❯"}</button>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "0 16px 14px" }}>
          {QUICK.map((q) => (
            <button key={q.sym} className="ghost" onClick={() => { setCommand(q.cmd); run(q.cmd); }} disabled={busy}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px" }}>
              <CoinIcon symbol={q.sym} size={16} /> {q.sym.replace("USDT", "")}
            </button>
          ))}
          <span style={{ marginLeft: "auto", alignSelf: "center" }} className="kicker dim">try DOGE → watch it reject</span>
        </div>
      </div>

      <LoopSteps active={active} />

      {error && <div className="panel" style={{ borderColor: "var(--red)", color: "var(--red)" }}>⚠ {error}</div>}

      {ctx && (
        <div className="rise">
          <div className="panel--head">
            <span className="kicker">Market Context · {ctx.symbol}</span>
            <AdapterBadge source={ctx.dataSource} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {SIG.map(([label, s]) => <SignalGauge key={label} label={label} value={s.score} hint={s.label} />)}
          </div>
        </div>
      )}

      <VerdictCard result={result} />
      {result && <DeepAnalysis symbol={result.symbol} />}

      {!ctx && !busy && (
        <div className="panel ticks" style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
          <div className="display" style={{ fontSize: 16, color: "var(--text-dim)" }}>Issue a command to run the full agent loop</div>
          <div style={{ marginTop: 8, fontSize: 13 }}>Perception → Decision → Execution → Risk Management</div>
        </div>
      )}
    </div>
  );
}
