const STEPS = [
  { key: "Perception", sub: "market signals" },
  { key: "Decision", sub: "score + direction" },
  { key: "Execution", sub: "sim order" },
  { key: "Risk", sub: "veto + sizing" },
];

export default function LoopSteps({ active = -1 }) {
  return (
    <div className="panel ticks" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
      {STEPS.map((s, i) => {
        const on = i <= active;
        return (
          <div key={s.key} style={{ position: "relative", padding: "6px 14px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 22, height: 22, display: "grid", placeItems: "center",
                fontFamily: "var(--mono)", fontSize: 11,
                color: on ? "#04130f" : "var(--muted)",
                background: on ? "var(--brand)" : "transparent",
                border: `1px solid ${on ? "var(--brand)" : "var(--line-bright)"}`,
                boxShadow: on ? "0 0 14px -2px var(--brand)" : "none",
                transition: "all .35s ease",
              }}>{i + 1}</span>
              <div style={{
                fontFamily: "var(--display)", fontSize: 13, letterSpacing: ".04em",
                color: on ? "var(--text)" : "var(--muted)", transition: "color .35s ease",
              }}>{s.key.toUpperCase()}</div>
            </div>
            <div className="kicker" style={{ marginTop: 6, marginLeft: 30, color: on ? "var(--brand-dim)" : "var(--muted)" }}>{s.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
