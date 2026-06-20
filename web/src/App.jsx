import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import Console from "./pages/Console";
import Autopilot from "./pages/Autopilot";
import MarketIntel from "./pages/MarketIntel";
import RiskCenter from "./pages/RiskCenter";
import TradeLog from "./pages/TradeLog";

export default function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Console />} />
          <Route path="/autopilot" element={<Autopilot />} />
          <Route path="/market" element={<MarketIntel />} />
          <Route path="/risk" element={<RiskCenter />} />
          <Route path="/log" element={<TradeLog />} />
        </Routes>
        <footer style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span className="kicker dim">RiskPilot AI · Bitget AI Base Camp Hackathon S1 · risk-first autonomous trading agent</span>
          <span style={{ display: "flex", gap: 16 }}>
            <a className="kicker" style={{ color: "var(--brand)" }} href="https://github.com/Jerry-Tekh/riskpilot-ai" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="kicker" style={{ color: "var(--brand)" }} href="https://www.bitget.com/en/activity/ai-get-agent/playbook" target="_blank" rel="noreferrer">Bitget Playbook ↗</a>
          </span>
        </footer>
      </main>
    </BrowserRouter>
  );
}
