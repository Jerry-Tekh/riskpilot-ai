export default function AdapterBadge({ source }) {
  const live = source === "live";
  const color = live ? "var(--green)" : "var(--amber)";
  return (
    <span style={{
      fontFamily: "var(--mono)", fontSize: 11, padding: "3px 9px",
      color, border: `1px solid ${color}55`, background: `${color}14`,
      display: "inline-flex", alignItems: "center", textTransform: "uppercase", letterSpacing: ".08em",
    }}>
      <span className={`dot ${live ? "live" : "amber"}`} style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {live ? "Live data" : "Cached"}
    </span>
  );
}
