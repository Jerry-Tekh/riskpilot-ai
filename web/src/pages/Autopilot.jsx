import { useEffect, useRef, useState } from "react";
import { getAutopilot, setAutopilot, getActivity } from "../api/client";

const TYPE_STYLE = {
  decision: { c: "var(--brand)", t: "DECISION" },
  reject: { c: "var(--red)", t: "REJECT" },
  execute: { c: "var(--green)", t: "EXECUTE" },
  monitor: { c: "var(--amber)", t: "MONITOR" },
  autopilot: { c: "var(--blue)", t: "SYSTEM" },
  risk: { c: "var(--red)", t: "RISK" },
  perceive: { c: "var(--text-dim)", t: "PERCEIVE" },
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
      <div className="panel ticks rise" style={{ borderColor: on ? "var(--green)" : "var(--line)", boxShadow: on ? "0 0 0 1px var(--green), 0 0 50px -22px var(--green)" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="kicker">Autonomous Mode</div>
            <div className="display" style={{ fontSize: 26, marginTop: 4, color: on ? "var(--green)" : "var(--text-dim)" }}>
              <span className={`dot ${on ? "live" : ""}`} style={{ background: on ? "var(--green)" : "var(--muted)", boxShadow: on ? "0 0 8px var(--green)" : "none" }} />
              {on ? "ENGAGED" : "STANDBY"}
            </div>
            <div className="dim" style={{ fontSize: 13, marginTop: 6, maxWidth: 520, lineHeight: 1.5 }}>
              The agent scans BTC · ETH · DOGE on a {status ? status.tickMs / 1000 : 12}s cycle, runs the full perception → decision → execution → risk loop, and trades with no human input. The background monitor closes positions on its own.
            </div>
          </div>
          <button onClick={toggle} disabled={busy}
            style={on ? { background: "linear-gradient(180deg,var(--red),#b3303d)", borderColor: "var(--red)", boxShadow: "0 0 24px -6px var(--red)" } : {}}>
            {busy ? "…" : on ? "Disengage" : "Engage Autopilot ❯"}
          </button>
        </div>
        {status && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, marginTop: 16, background: "var(--line)", border: "1px solid var(--line)" }}>
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
              <div key={e.id} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--line)", alignItems: "baseline" }}>
                <span className="dim" style={{ minWidth: 64 }}>{new Date(e.at).toLocaleTimeString()}</span>
                <span style={{ color: st.c, minWidth: 78, fontFamily: "var(--display)", fontSize: 10, letterSpacing: ".08em" }}>{st.t}</span>
                <span style={{ color: "var(--text)" }}>{e.message}</span>
              </div>
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
