import { motion } from "motion/react";

const STEPS = [
  { key: "Perception", sub: "market signals" },
  { key: "Decision", sub: "score + direction" },
  { key: "Execution", sub: "sim order" },
  { key: "Risk", sub: "veto + sizing" },
];

export default function LoopSteps({ active = -1 }) {
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <div className="cards cards-4" style={{ gap: 0 }}>
        {STEPS.map((s, i) => {
          const on = i <= active;
          return (
            <div key={s.key} style={{ position: "relative", padding: "16px 18px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <motion.span
                  animate={{
                    backgroundColor: on ? "var(--brand)" : "rgba(0,0,0,0)",
                    borderColor: on ? "var(--brand)" : "var(--line-strong)",
                    color: on ? "#fff" : "var(--muted)",
                    scale: on ? 1 : 0.92,
                  }}
                  transition={{ duration: 0.35 }}
                  style={{ width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center",
                    fontFamily: "var(--mono)", fontSize: 12, border: "1.5px solid", flex: "none" }}>
                  {on ? "✓" : i + 1}
                </motion.span>
                <div className="display" style={{ fontSize: 15, color: on ? "var(--text)" : "var(--muted)", transition: "color .35s" }}>{s.key}</div>
              </div>
              <div className="kicker" style={{ marginTop: 8, marginLeft: 36, color: on ? "var(--brand)" : "var(--muted)" }}>{s.sub}</div>
              {on && i < STEPS.length - 1 && (
                <motion.div layout style={{ position: "absolute", right: 0, top: "50%", width: 6, height: 6, borderRadius: "50%", background: "var(--brand)", transform: "translate(50%,-50%)" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
