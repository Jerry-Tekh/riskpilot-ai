import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Power, Cpu, XCircle, Zap, Activity, Settings2, AlertTriangle, Eye } from "lucide-react";
import { getAutopilot, setAutopilot, getActivity } from "../api/client";
import AgentAvatar from "../components/AgentAvatar";

const TYPE_STYLE = {
  decision: { c: "var(--brand)", t: "DECISION", Icon: Cpu },
  reject: { c: "var(--red)", t: "REJECT", Icon: XCircle },
  execute: { c: "var(--green)", t: "EXECUTE", Icon: Zap },
  monitor: { c: "var(--amber)", t: "MONITOR", Icon: Activity },
  autopilot: { c: "var(--blue)", t: "SYSTEM", Icon: Settings2 },
  risk: { c: "var(--red)", t: "RISK", Icon: AlertTriangle },
  perceive: { c: "var(--text-dim)", t: "PERCEIVE", Icon: Eye },
};

export default function Autopilot() {
  const [status, setStatus] = useState(null);
  const [feed, setFeed] = useState([]);
  const [busy, setBusy] = useState(false);
  const feedRef = useRef(null);

  async function refresh() {
    try {
      const [s, a] = await Promise.all([getAutopilot(), getActivity(60)]);
      setStatus(s); setFeed(a);
    } catch { /* ignore transient */ }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2500);
    return () => clearInterval(id);
  }, []);

  async function toggle() {
    setBusy(true);
    try { const s = await setAutopilot(!status?.enabled); setStatus(s); await refresh(); }
    finally { setBusy(false); }
  }

  const on = status?.enabled;

  return (
    <div className="grid" style={{ gap: 14 }}>
      {/* control deck */}
      <div className="panel rise" style={{ borderColor: on ? "var(--green)" : "var(--line)", boxShadow: on ? "0 0 0 1px var(--green), var(--shadow)" : "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <AgentAvatar size={64} state={on ? "thinking" : "idle"} />
            <div>
              <div className="kicker">Autonomous Mode</div>
              <div className="display" style={{ fontSize: 27, marginTop: 2, color: on ? "var(--green)" : "var(--text-dim)" }}>
                {on ? "Engaged" : "Standby"}
              </div>
              <div className="dim" style={{ fontSize: 13, marginTop: 6, maxWidth: 480, lineHeight: 1.5 }}>
                The agent scans BTC · ETH · DOGE on a {status ? status.tickMs / 1000 : 12}s cycle, runs the full perception → decision → execution → risk loop, and trades with no human input.
              </div>
            </div>
          </div>
          <button onClick={toggle} disabled={busy}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, ...(on ? { background: "linear-gradient(180deg,var(--red),#b3303d)", borderColor: "#b3303d" } : {}) }}>
            <Power size={16} /> {busy ? "…" : on ? "Disengage" : "Engage Autopilot"}
          </button>
        </div>
        {status && (
          <div className="cards cards-4 seam" style={{ marginTop: 16 }}>
            <Cell label="Status" value={on ? "Running" : "Idle"} tone={on ? "var(--green)" : "var(--muted)"} />
            <Cell label="Cycles Run" value={status.ticks} />
            <Cell label="Uptime" value={`${status.uptimeSec}s`} />
            <Cell label="Auto-stop" value={`${status.ticks}/${status.maxTicks}`} />
          </div>
        )}
      </div>

      {/* live feed */}
      <div className="panel ticks rise">
        <div className="panel--head">
          <span className="kicker">Live Activity Feed</span>
          <span className="kicker dim">{on ? "streaming…" : "last actions"}</span>
        </div>
        <div ref={feedRef} style={{ maxHeight: 460, overflow: "auto", fontFamily: "var(--mono)", fontSize: 12.5 }}>
          {feed.length === 0 && <div className="muted" style={{ padding: "20px 0", textAlign: "center" }}>No activity yet — engage Autopilot to watch the agent work.</div>}
          {feed.map((e) => {
            const st = TYPE_STYLE[e.type] || TYPE_STYLE.perceive;
            return (
              <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                style={{ display: "flex", gap: 11, padding: "9px 0", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
                <span className="dim" style={{ minWidth: 62 }}>{new Date(e.at).toLocaleTimeString()}</span>
                <span style={{ color: st.c, minWidth: 92, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--sans)", fontWeight: 600, fontSize: 10.5, letterSpacing: ".06em" }}>
                  <st.Icon size={14} /> {st.t}
                </span>
                <span style={{ color: "var(--text)" }}>{e.message}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value, tone }) {
  return (
    <div style={{ background: "var(--panel-2)", padding: "11px 13px" }}>
      <div className="kicker">{label}</div>
      <div className="num" style={{ fontSize: 18, marginTop: 4, color: tone || "var(--text)" }}>{value}</div>
    </div>
  );
}
