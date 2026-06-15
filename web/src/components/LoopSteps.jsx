const STEPS = ["Perception", "Decision", "Execution", "Risk"];

export default function LoopSteps({ active }) {
  return (
    <div className="panel" style={{ display: "flex", gap: 12 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex: 1, opacity: i <= active ? 1 : 0.3, borderLeft: "2px solid var(--accent)", paddingLeft: 8 }}>
          <div style={{ color: "var(--muted)" }}>{`0${i + 1}`}</div>
          <div>{s}</div>
        </div>
      ))}
    </div>
  );
}
