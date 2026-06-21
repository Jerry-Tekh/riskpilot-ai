import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import TopBar from "./components/TopBar";
import AnimatedBackground from "./components/AnimatedBackground";
import Console from "./pages/Console";
import Autopilot from "./pages/Autopilot";
import MarketIntel from "./pages/MarketIntel";
import RiskCenter from "./pages/RiskCenter";
import TradeLog from "./pages/TradeLog";

function Shell() {
  const loc = useLocation();
  return (
    <>
      <AnimatedBackground />
      <TopBar />
      <main className="wrap">
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}>
            <Routes location={loc}>
              <Route path="/" element={<Console />} />
              <Route path="/autopilot" element={<Autopilot />} />
              <Route path="/market" element={<MarketIntel />} />
              <Route path="/risk" element={<RiskCenter />} />
              <Route path="/log" element={<TradeLog />} />
            </Routes>
          </motion.div>
        </AnimatePresence>

        <footer style={{ marginTop: 32, paddingTop: 18, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span className="kicker dim">RiskPilot AI · Bitget AI Base Camp Hackathon S1 · risk-first autonomous trading agent</span>
          <span style={{ display: "flex", gap: 16 }}>
            <a className="kicker" style={{ color: "var(--orange)" }} href="https://github.com/Jerry-Tekh/riskpilot-ai" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="kicker" style={{ color: "var(--orange)" }} href="https://www.bitget.com/en/activity/ai-get-agent/playbook/f843acbc-92db-494d-9af5-1d71b4da95ff" target="_blank" rel="noreferrer">Bitget Playbook ↗</a>
          </span>
        </footer>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
