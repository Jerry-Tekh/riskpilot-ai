export default function SignalGauge({ label, value }) {
  const c = value >= 66 ? "var(--green)" : value >= 40 ? "var(--amber)" : "var(--red)";
  return (
    <div className="panel">
      <div style={{ color: "var(--muted)" }}>{label}</div>
      <div className="num" style={{ fontSize: 20, color: c }}>{value}</div>
      <div style={{ height: 4, background: "var(--line)" }}><div style={{ width: `${value}%`, height: 4, background: c }} /></div>
    </div>
  );
}
