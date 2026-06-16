export default function Brand({ size = 34 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="RiskPilot logo">
        {/* shield */}
        <path d="M24 3 L41 9 V24 C41 35 33 42 24 45 C15 42 7 35 7 24 V9 Z"
          fill="rgba(47,227,198,.08)" stroke="var(--brand)" strokeWidth="1.6" />
        {/* radar rings */}
        <circle cx="24" cy="23" r="11" stroke="var(--brand-dim)" strokeWidth="1" opacity=".55" />
        <circle cx="24" cy="23" r="6" stroke="var(--brand-dim)" strokeWidth="1" opacity=".8" />
        {/* crosshair */}
        <path d="M24 8 V38 M9 23 H39" stroke="var(--brand)" strokeWidth="1" opacity=".5" />
        {/* sweep blip */}
        <path d="M24 23 L33 16" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="33" cy="16" r="2.4" fill="var(--brand)" />
      </svg>
      <div style={{ lineHeight: 1.05 }}>
        <div className="display" style={{ fontSize: 19, letterSpacing: ".04em" }}>
          RISK<span className="brand">PILOT</span> <span style={{ color: "var(--muted)", fontWeight: 400 }}>AI</span>
        </div>
        <div className="kicker" style={{ marginTop: 3 }}>Risk-First Trading Agent</div>
      </div>
    </div>
  );
}
