import { Router } from "express";
import { buildContext } from "../orchestrator.js";

const r = Router();

r.get("/:symbol", async (req, res) => {
  try {
    res.json(await buildContext(req.params.symbol.toUpperCase()));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
