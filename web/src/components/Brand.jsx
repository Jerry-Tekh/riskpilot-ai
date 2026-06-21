import AgentAvatar from "./AgentAvatar";

export default function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
      <AgentAvatar size={44} state="idle" />
      <div style={{ lineHeight: 1.1 }}>
        <div className="display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-.01em" }}>
          <span className="orange">Risk</span><span className="brand">Pilot</span> <span style={{ color: "var(--muted)", fontWeight: 500 }}>AI</span>
        </div>
        <div className="kicker" style={{ marginTop: 2 }}>Risk-First Trading Agent</div>
      </div>
    </div>
  );
}
