export default function SignalGauge({ label, value, hint }) {
  const c = value >= 75 ? "var(--green)" : value >= 50 ? "var(--brand)" : value >= 35 ? "var(--amber)" : "var(--red)";
  const R = 26, C = 2 * Math.PI * R;
  const off = C * (1 - value / 100);
  return (
    <div className="panel ticks" style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ flex: "none" }}>
        <circle cx="32" cy="32" r={R} fill="none" stroke="var(--line)" strokeWidth="5" />
        <circle cx="32" cy="32" r={R} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1)", filter: `drop-shadow(0 0 5px ${c})` }} />
        <text x="32" y="37" textAnchor="middle" className="num" fontSize="16" fill="var(--text)">{value}</text>
      </svg>
      <div style={{ minWidth: 0 }}>
        <div className="kicker">{label}</div>
        <div className="display" style={{ fontSize: 14, color: c, marginTop: 3 }}>{hint}</div>
      </div>
    </div>
  );
}
