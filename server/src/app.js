import express from "express";
import cors from "cors";
import agent from "./routes/agent.js";
import market from "./routes/market.js";
import portfolio from "./routes/portfolio.js";
import data from "./routes/data.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/agent", agent);
app.use("/api/market", market);
app.use("/api/portfolio", portfolio);
app.use("/api", data);

export default app;
