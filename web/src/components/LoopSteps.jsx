import { motion } from "motion/react";
import { Eye, Cpu, Zap, ShieldCheck, Check } from "lucide-react";

const STEPS = [
  { key: "Perception", sub: "market signals", Icon: Eye },
  { key: "Decision", sub: "score + direction", Icon: Cpu },
  { key: "Execution", sub: "sim order", Icon: Zap },
  { key: "Risk", sub: "veto + sizing", Icon: ShieldCheck },
];

export default function LoopSteps({ active = -1 }) {
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <div className="cards cards-4" style={{ gap: 0 }}>
        {STEPS.map((s, i) => {
          const on = i <= active;
          const current = i === active;
          return (
            <div key={s.key} style={{ position: "relative", padding: "16px 18px", borderLeft: i ? "1px solid var(--line)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <motion.span
                  animate={{
                    backgroundColor: on ? "var(--brand)" : "var(--panel-2)",
                    borderColor: on ? "var(--brand)" : "var(--line-strong)",
                    color: on ? "#fff" : "var(--muted)",
                    scale: current ? [1, 1.12, 1] : 1,
                  }}
                  transition={{ duration: current ? 0.6 : 0.35, repeat: current ? Infinity : 0, repeatType: "reverse" }}
                  style={{ width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center",
                    border: "1.5px solid", flex: "none" }}>
                  {on && !current ? <Check size={16} strokeWidth={2.6} /> : <s.Icon size={16} strokeWidth={2.2} />}
                </motion.span>
                <div className="display" style={{ fontSize: 15, color: on ? "var(--text)" : "var(--muted)", transition: "color .35s" }}>{s.key}</div>
              </div>
              <div className="kicker" style={{ marginTop: 8, marginLeft: 43, color: on ? "var(--brand)" : "var(--muted)" }}>{s.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
