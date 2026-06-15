import { useState } from "react";
import { runLoop } from "../api/client";
import LoopSteps from "../components/LoopSteps";
import VerdictCard from "../components/VerdictCard";
import SignalGauge from "../components/SignalGauge";
import AdapterBadge from "../components/AdapterBadge";

export default function Console() {
  const [command, setCommand] = useState("Trade BTC using current conditions");
  const [active, setActive] = useState(-1);
  const [result, setResult] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function run() {
    setBusy(true); setResult(null); setError(null); setActive(0);
    try {
      const data = await runLoop(command);
      const r = data.result; const c = r.marketContext;
      setCtx(c);
      for (let i = 0; i < 4; i++) { await new Promise((res) => setTimeout(res, 450)); setActive(i); }
      setResult({ ...r, symbol: c.symbol });
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
      setActive(-1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="panel" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ color: "var(--accent)" }}>&gt;</span>
        <input value={command} onChange={(e) => setCommand(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--mono)", fontSize: 14 }} />
        <button onClick={run} disabled={busy}>{busy ? "RUNNING…" : "RUN LOOP"}</button>
      </div>
      <LoopSteps active={active} />
      {error && <div className="panel red">Error: {error}</div>}
      {ctx && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8 }}>
          <SignalGauge label="Trend" value={ctx.trend.score} />
          <SignalGauge label="Momentum" value={ctx.momentum.score} />
          <SignalGauge label="Volatility" value={ctx.volatility.score} />
          <SignalGauge label="Sentiment" value={ctx.sentiment.score} />
          <SignalGauge label="Funding" value={ctx.funding.score} />
          <SignalGauge label="News" value={ctx.newsImpact.score} />
        </div>
      )}
      {ctx && <div className="panel">Data source: <AdapterBadge source={ctx.dataSource} /></div>}
      <VerdictCard result={result} />
      <div className="panel" style={{ color: "var(--muted)" }}>Try: "Trade DOGE" to see a rejection.</div>
    </div>
  );
}
