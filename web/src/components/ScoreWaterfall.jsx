// Visual waterfall: how each signal builds the trade score from a 50 baseline.
// Bars are drawn cumulatively so you can see the running total rise/fall to the final score.
export default function ScoreWaterfall({ breakdown }) {
  if (!breakdown?.components) return null;
  const { components, total } = breakdown;

  // running cumulative for positioning each floating bar
  let cum = 0;
  const rows = components.map((c) => {
    const start = cum;
    cum += c.value;
    return { ...c, start, end: cum };
  });

  const max = Math.max(100, ...rows.map((r) => Math.max(r.start, r.end)));
  const pct = (v) => `${(v / max) * 100}%`;

  const colorFor = (kind) => (kind === "base" ? "var(--text-dim)" : kind === "positive" ? "var(--green)" : "var(--red)");

  return (
    <div className="panel ticks rise">
      <div className="panel--head">
        <span className="kicker">Score Breakdown · how {total} was built</span>
        <span className="kicker dim">baseline 50 + signals</span>
      </div>

      <div style={{ display: "grid", gap: 7 }}>
        {rows.map((r) => {
          const lo = Math.min(r.start, r.end);
          const w = Math.abs(r.value);
          return (
            <div key={r.key} style={{ display: "grid", gridTemplateColumns: "92px 1fr 54px", alignItems: "center", gap: 10 }}>
              <span className="kicker" style={{ textAlign: "right" }}>{r.label}</span>
              <div style={{ position: "relative", height: 18, background: "var(--panel-2)", border: "1px solid var(--line)" }}>
                <div style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: pct(lo), width: pct(w),
                  background: colorFor(r.kind), opacity: r.kind === "base" ? 0.5 : 0.85,
                  boxShadow: r.kind !== "base" ? `0 0 10px -3px ${colorFor(r.kind)}` : "none",
                }} />
              </div>
              <span className="num" style={{ fontSize: 12, textAlign: "right", color: colorFor(r.kind) }}>
                {r.value > 0 && r.kind !== "base" ? "+" : ""}{r.value}
              </span>
            </div>
          );
        })}

        {/* total */}
        <div style={{ display: "grid", gridTemplateColumns: "92px 1fr 54px", alignItems: "center", gap: 10, marginTop: 4, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
          <span className="kicker" style={{ textAlign: "right", color: "var(--brand)" }}>Trade Score</span>
          <div style={{ position: "relative", height: 22, background: "var(--panel-2)", border: "1px solid var(--brand-dim)" }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: pct(total), background: "linear-gradient(90deg, var(--brand-dim), var(--brand))", boxShadow: "0 0 14px -3px var(--brand)" }} />
          </div>
          <span className="num" style={{ fontSize: 16, textAlign: "right", color: "var(--brand)" }}>{total}</span>
        </div>
      </div>
    </div>
  );
}
