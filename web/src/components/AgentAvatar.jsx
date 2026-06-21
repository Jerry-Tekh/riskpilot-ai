import { motion, useReducedMotion } from "motion/react";

/**
 * Animated AI-agent presence. An intelligent "core" that breathes, with
 * orbiting particles, rotating rings, and a radar sweep. Reacts to `state`.
 *   state: "idle" | "thinking" | "approve" | "modify" | "reject" | "hold"
 */
const STATE_COLOR = {
  idle: "var(--brand)",
  thinking: "var(--brand)",
  approve: "var(--green)",
  modify: "var(--amber)",
  reject: "var(--red)",
  hold: "var(--blue)",
};

export default function AgentAvatar({ size = 40, state = "idle" }) {
  const reduce = useReducedMotion();
  const color = STATE_COLOR[state] || "var(--brand)";
  const thinking = state === "thinking";
  const spin = reduce ? {} : { rotate: 360 };
  const cx = 50, cy = 50;

  return (
    <motion.svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="RiskPilot agent"
      animate={reduce ? {} : { scale: [1, 1.04, 1] }}
      transition={{ duration: thinking ? 1.1 : 2.6, repeat: Infinity, ease: "easeInOut" }}>
      {/* soft halo */}
      <motion.circle cx={cx} cy={cy} r="46" fill={color} opacity="0.10"
        animate={reduce ? {} : { opacity: [0.06, 0.16, 0.06], scale: [0.92, 1.04, 0.92] }}
        transition={{ duration: thinking ? 1.4 : 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }} />

      {/* outer ring */}
      <motion.circle cx={cx} cy={cy} r="40" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.5"
        strokeDasharray="6 10" animate={spin}
        transition={{ duration: thinking ? 5 : 18, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }} />
      {/* inner ring (counter) */}
      <motion.circle cx={cx} cy={cy} r="30" fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="1.5"
        strokeDasharray="3 7" animate={reduce ? {} : { rotate: -360 }}
        transition={{ duration: thinking ? 4 : 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }} />

      {/* radar sweep */}
      {!reduce && (
        <motion.line x1="50" y1="50" x2="50" y2="14" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          animate={spin} transition={{ duration: thinking ? 1.6 : 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px", opacity: 0.8 }} />
      )}

      {/* breathing core */}
      <motion.circle cx={cx} cy={cy} r="11" fill={color}
        animate={reduce ? {} : { r: thinking ? [10, 13, 10] : [10.5, 12, 10.5] }}
        transition={{ duration: thinking ? 0.8 : 2, repeat: Infinity, ease: "easeInOut" }} />
      <circle cx={cx} cy={cy} r="5" fill="#fff" opacity="0.85" />

      {/* orbiting particles */}
      {!reduce && [0, 120, 240].map((deg, i) => (
        <motion.g key={i} animate={{ rotate: 360 }}
          transition={{ duration: thinking ? 3 : 9, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
          style={{ transformOrigin: "50px 50px" }}>
          <circle cx="50" cy="14" r="2.6" fill={color}
            transform={`rotate(${deg} 50 50)`} />
        </motion.g>
      ))}
    </motion.svg>
  );
}
