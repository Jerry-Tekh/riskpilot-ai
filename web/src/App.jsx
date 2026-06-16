import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import Console from "./pages/Console";
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
          <Route path="/market" element={<MarketIntel />} />
          <Route path="/risk" element={<RiskCenter />} />
          <Route path="/log" element={<TradeLog />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
