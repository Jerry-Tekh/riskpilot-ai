import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Terminal, Bot, LineChart, ShieldAlert, ScrollText } from "lucide-react";
import Brand from "./Brand";
import { getHealth, getMetrics } from "../api/client";

const TABS = [
  { to: "/", label: "Console", end: true, Icon: Terminal },
  { to: "/autopilot", label: "Autopilot", Icon: Bot },
  { to: "/market", label: "Market", Icon: LineChart },
  { to: "/risk", label: "Risk", Icon: ShieldAlert },
  { to: "/log", label: "Trade Log", Icon: ScrollText },
];

export default function TopBar() {
  const [online, setOnline] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const loc = useLocation();

  useEffect(() => {
    let alive = true;
    const ping = () => getHealth().then(() => alive && setOnline(true)).catch(() => alive && setOnline(false));
    const pull = () => getMetrics().then((m) => alive && setMetrics(m)).catch(() => {});
    ping(); pull();
    const id = setInterval(() => { ping(); pull(); }, 8000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(252,250,244,.82)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "14px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Brand />
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Stat label="Agent" value={online ? "Online" : "Offline"} good={online} />
            <Stat label="Monitor" value="Active" good className="hide-sm" />
            {metrics && <Stat label="Decisions" value={metrics.totals.decisions} neutral className="hide-sm" />}
          </div>
        </div>

        <nav style={{ display: "flex", gap: 4, marginTop: 14, overflowX: "auto", scrollbarWidth: "none" }}>
          {TABS.map((t) => {
            const active = t.end ? loc.pathname === "/" : loc.pathname.startsWith(t.to);
            return (
              <NavLink key={t.to} to={t.to} end={t.end}
                style={{ position: "relative", padding: "10px 14px", whiteSpace: "nowrap",
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600,
                  color: active ? "var(--orange-deep)" : "var(--text-dim)" }}>
                <t.Icon size={16} strokeWidth={2.2} /> {t.label}
                {active && (
                  <motion.span layoutId="nav-underline"
                    style={{ position: "absolute", left: 12, right: 12, bottom: -1, height: 3, background: "var(--orange)", borderRadius: 3 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Stat({ label, value, good, neutral, className }) {
  const color = neutral ? "var(--text-dim)" : good ? "var(--green)" : "var(--red)";
  return (
    <div className={className} style={{ textAlign: "right", lineHeight: 1.15 }}>
      <div className="kicker">{label}</div>
      <div className="num" style={{ fontSize: 13, color, marginTop: 2, fontWeight: 600 }}>
        {!neutral && <span className={`dot ${good ? "live" : ""}`} style={{ background: color, color }} />}
        {value}
      </div>
    </div>
  );
}
