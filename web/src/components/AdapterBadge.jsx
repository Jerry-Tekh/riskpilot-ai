export default function AdapterBadge({ source }) {
  const live = source === "live";
  return (
    <span className="pill" style={{
      color: live ? "var(--green)" : "var(--amber)",
      background: live ? "var(--green-soft)" : "var(--amber-soft)",
      border: `1px solid ${live ? "#bfe2cd" : "#ecdcb0"}`,
    }}>
      <span className={`dot ${live ? "live" : ""}`} style={{ background: live ? "var(--green)" : "var(--amber)", color: live ? "var(--green)" : "var(--amber)" }} />
      {live ? "Live data" : "Cached"}
    </span>
  );
}
