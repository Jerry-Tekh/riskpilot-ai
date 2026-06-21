import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

// Soft drifting "blobs" + gently rising bubbles. Warm, slow, low-opacity —
// atmosphere without hurting legibility. Sits fixed behind all content.

const BLOBS = [
  { c: "rgba(15,122,99,0.30)",  size: 520, top: "-12%", left: "62%", dur: 26, dx: 60, dy: 40 },
  { c: "rgba(197,137,27,0.22)", size: 460, top: "55%",  left: "-8%", dur: 32, dx: 70, dy: -50 },
  { c: "rgba(31,157,107,0.20)", size: 400, top: "70%",  left: "70%", dur: 28, dx: -55, dy: -40 },
  { c: "rgba(47,109,176,0.14)", size: 360, top: "8%",   left: "8%",  dur: 34, dx: 45, dy: 60 },
  { c: "rgba(15,122,99,0.16)",  size: 300, top: "32%",  left: "44%", dur: 22, dx: -40, dy: 50 },
];

export default function AnimatedBackground() {
  const reduce = useReducedMotion();
  const bubbles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      id: i,
      left: Math.round(Math.random() * 100),
      size: 8 + Math.round(Math.random() * 26),
      dur: 14 + Math.random() * 16,
      delay: -Math.random() * 20,
      hue: i % 3,
    })),
    []
  );
  const bubbleColor = (h) => (h === 0 ? "rgba(15,122,99,0.18)" : h === 1 ? "rgba(197,137,27,0.16)" : "rgba(31,157,107,0.14)");

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* drifting blobs */}
      {BLOBS.map((b, i) => (
        <motion.div key={i}
          style={{ position: "absolute", top: b.top, left: b.left, width: b.size, height: b.size, borderRadius: "50%",
            background: b.c, filter: "blur(70px)", willChange: "transform" }}
          animate={reduce ? {} : { x: [0, b.dx, 0], y: [0, b.dy, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }} />
      ))}

      {/* rising bubbles */}
      {!reduce && bubbles.map((b) => (
        <span key={b.id} style={{
          position: "absolute", bottom: -40, left: `${b.left}%`,
          width: b.size, height: b.size, borderRadius: "50%",
          background: bubbleColor(b.hue), border: "1px solid rgba(255,255,255,0.25)",
          animation: `bubble ${b.dur}s linear ${b.delay}s infinite`,
        }} />
      ))}

      <style>{`
        @keyframes bubble {
          0%   { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
          12%  { opacity: 1; }
          50%  { transform: translateY(-52vh) translateX(14px) scale(1); }
          88%  { opacity: .7; }
          100% { transform: translateY(-104vh) translateX(-10px) scale(1.1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { @keyframes bubble { from,to { opacity:0 } } }
      `}</style>
    </div>
  );
}
