import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", adapters: { skillHub: "unknown", agentHub: "unknown", qwen: "unknown" } });
});

export default app;
