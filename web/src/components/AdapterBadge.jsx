export default function AdapterBadge({ source }) {
  return <span className={source === "live" ? "green" : "amber"}>● {source || "unknown"}</span>;
}
