import { useEffect, useState } from "react";
import { getScenarios, stressTest } from "../api/client";
import VerdictCard from "./VerdictCard";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "DOGEUSDT"];

export default function StressTest() {
  const [scenarios, setScenarios] = useState({});
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [active, setActive] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => { getScenarios().then(setScenarios).catch(() => {}); }, []);

  async function run(scenario) {
    setBusy(true); setActive(scenario); setResult(null); setErr(null);
    try {
      const r = await stressTest(symbol, scenario);
      setResult({ ...r, symbol });
    } catch (e) { setErr(e?.response?.data?.error || e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="panel ticks rise">
      <div className="panel--head">
        <span className="kicker">Stress Test · inject a scenario, watch the agent respond</span>
        <div style={{ display: "flex", gap: 6 }}>
          {SYMBOLS.map((s) => (
            <button key={s} className={`ghost ${s === symbol ? "active" : ""}`} onClick={() => setSymbol(s)} style={{ padding: "5px 10px", fontSize: 11 }}>{s.replace("USDT", "")}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
        {Object.entries(scenarios).map(([key, meta]) => (
          <button key={key} className={`ghost ${active === key ? "active" : ""}`} onClick={() => run(key)} disabled={busy}
            style={{ textAlign: "left", padding: "10px 12px", display: "block" }}>
            <div className="display" style={{ fontSize: 12, color: active === key ? "var(--brand)" : "var(--text)" }}>{meta.label}</div>
            <div className="kicker dim" style={{ marginTop: 4, textTransform: "none", letterSpacing: 0, lineHeight: 1.4 }}>{meta.desc}</div>
          </button>
        ))}
      </div>

      {busy && <div className="dim" style={{ marginTop: 12, fontSize: 13 }}>Running scenario through perception → decision → risk…</div>}
      {err && <div className="red" style={{ marginTop: 12, fontSize: 13 }}>⚠ {err}</div>}
      {result && <div style={{ marginTop: 12 }}><VerdictCard result={result} /></div>}
    </div>
  );
}
