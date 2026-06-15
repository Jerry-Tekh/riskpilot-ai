import { useEffect, useState } from "react";
import { getHealth } from "./api/client";

export default function App() {
  const [health, setHealth] = useState(null);
  useEffect(() => { getHealth().then(setHealth).catch(() => setHealth({ status: "error" })); }, []);
  return <pre>RiskPilot AI — API: {JSON.stringify(health)}</pre>;
}
