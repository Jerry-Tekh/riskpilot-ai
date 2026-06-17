import { Router } from "express";
import { start, stop, status } from "../autopilot.js";
import { getActivity } from "../activity.js";

const r = Router();

r.get("/autopilot", (_req, res) => res.json(status()));
r.post("/autopilot", (req, res) => {
  res.json(req.body.enabled ? start() : stop());
});
r.get("/activity", (req, res) => res.json(getActivity(Number(req.query.limit) || 50)));

export default r;
