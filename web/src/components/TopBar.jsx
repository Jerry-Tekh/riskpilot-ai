import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Brand from "./Brand";
import { getHealth } from "../api/client";

const TABS = [
  { to: "/", label: "Console", end: true },
  { to: "/market", label: "Market Intel" },
  { to: "/risk", label: "Risk Center" },
  { to: "/log", label: "Trade Log" },
];

export default function TopBar() {
  const [online, setOnline] = useState(false);
  useEffect(() => {
    let alive = true;
    const ping = () => getHealth().then(() => alive && setOnline(true)).catch(() => alive && setOnline(false));
    ping();
    const id = setInterval(ping, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <header style={{ position: "relative", borderBottom: "1px solid var(--line)", overflow: "hidden" }}>
      {/* ambient backdrop */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "url('/ambient/mesh.jpg')", backgroundSize: "cover", backgroundPosition: "center",
        opacity: .14, filter: "saturate(1.1)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "linear-gradient(180deg, rgba(6,8,12,.55), rgba(6,8,12,.92))",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", padding: "18px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Brand />
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <Stat label="Agent" value={online ? "ONLINE" : "OFFLINE"} good={online} />
            <Stat label="Risk Monitor" value="ACTIVE" good />
            <Stat label="Mode" value="SIM" neutral />
          </div>
        </div>

        <nav style={{ display: "flex", gap: 0, marginTop: 16 }}>
          {TABS.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end}
              style={({ isActive }) => ({
                fontFamily: "var(--display)", fontSize: 12.5, letterSpacing: ".06em", textTransform: "uppercase",
                padding: "12px 18px", color: isActive ? "var(--brand)" : "var(--text-dim)",
                borderBottom: isActive ? "2px solid var(--brand)" : "2px solid transparent",
                background: isActive ? "linear-gradient(180deg, transparent, rgba(47,227,198,.06))" : "transparent",
                transition: "color .15s ease",
              })}>
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Stat({ label, value, good, neutral }) {
  const color = neutral ? "var(--text-dim)" : good ? "var(--green)" : "var(--red)";
  return (
    <div style={{ textAlign: "right", lineHeight: 1.1 }}>
      <div className="kicker">{label}</div>
      <div className="num" style={{ fontSize: 13, color, marginTop: 3 }}>
        {!neutral && <span className={`dot ${good ? "live" : "amber"}`} style={{ background: color, boxShadow: `0 0 8px ${color}` }} />}
        {value}
      </div>
    </div>
  );
}
