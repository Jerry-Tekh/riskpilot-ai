import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Console from "./pages/Console";
import MarketIntel from "./pages/MarketIntel";
import RiskCenter from "./pages/RiskCenter";
import TradeLog from "./pages/TradeLog";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <NavLink to="/" end>CONSOLE</NavLink>
        <NavLink to="/market">MARKET</NavLink>
        <NavLink to="/risk">RISK CENTER</NavLink>
        <NavLink to="/log">TRADE LOG</NavLink>
      </nav>
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Console />} />
          <Route path="/market" element={<MarketIntel />} />
          <Route path="/risk" element={<RiskCenter />} />
          <Route path="/log" element={<TradeLog />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
