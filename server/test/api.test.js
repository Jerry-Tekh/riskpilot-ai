import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("health", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("agent run e2e", () => {
  it("POST /api/agent/run returns a verdict", async () => {
    const res = await request(app).post("/api/agent/run").send({ command: "Trade BTC using current conditions" });
    expect(res.status).toBe(200);
    expect(["APPROVE", "MODIFY", "REJECT"]).toContain(res.body.result.verdict);
  });
});
