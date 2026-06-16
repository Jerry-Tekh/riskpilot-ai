import { useState } from "react";
import { deepAnalysis } from "../api/client";

// Minimal markdown: ## headers + paragraphs. Renders Qwen's structured deep-dive.
function render(md) {
  const blocks = md.split("\n").filter((l) => l.trim());
  return blocks.map((line, i) => {
    if (line.startsWith("## ")) return <div key={i} className="kicker" style={{ color: "var(--brand)", marginTop: i ? 14 : 0, marginBottom: 6 }}>{line.slice(3)}</div>;
    if (line.startsWith("#")) return <div key={i} className="display" style={{ fontSize: 15, marginBottom: 8 }}>{line.replace(/^#+\s*/, "")}</div>;
    return <p key={i} style={{ margin: "0 0 8px", color: "var(--text-dim)", fontSize: 13.5, lineHeight: 1.6 }}>{line.replace(/\*\*/g, "")}</p>;
  });
}

export default function DeepAnalysis({ symbol }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  async function run() {
    setState("loading"); setErr(null);
    try {
      const r = await deepAnalysis(symbol);
      setData(r); setState("done");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message); setState("error");
    }
  }

  if (state === "idle") {
    return (
      <button className="ghost" onClick={run} style={{ display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
        <span className="brand">⊹</span> Deep Analysis · Qwen reasoning
      </button>
    );
  }

  return (
    <div className="panel ticks rise" style={{ borderColor: "var(--brand-dim)" }}>
      <div className="panel--head">
        <span className="kicker">Deep Analysis · {symbol}</span>
        {state === "done" && data?.tokens != null && <span className="kicker dim">qwen 3.6 · {data.tokens} tokens</span>}
      </div>

      {state === "loading" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
          <span className="thinking-dot" /><span className="thinking-dot" style={{ animationDelay: ".2s" }} /><span className="thinking-dot" style={{ animationDelay: ".4s" }} />
          <span className="dim" style={{ fontSize: 13 }}>Qwen is reasoning through the market — full chain-of-thought…</span>
        </div>
      )}

      {state === "error" && <div className="red" style={{ fontSize: 13 }}>⚠ {err}</div>}

      {state === "done" && data && <div>{render(data.analysis)}</div>}
    </div>
  );
}
