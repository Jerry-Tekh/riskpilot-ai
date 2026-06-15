import { describe, it, expect } from "vitest";
import { withFallback } from "../src/adapters/withFallback.js";

describe("withFallback", () => {
  it("returns live result and tags source=live", async () => {
    const r = await withFallback(async () => ({ a: 1 }), () => ({ a: 0 }));
    expect(r).toEqual({ a: 1, dataSource: "live" });
  });
  it("falls back on throw and tags source=cached", async () => {
    const r = await withFallback(async () => { throw new Error("down"); }, () => ({ a: 0 }));
    expect(r).toEqual({ a: 0, dataSource: "cached" });
  });
  it("falls back on timeout", async () => {
    const slow = () => new Promise((res) => setTimeout(() => res({ a: 1 }), 1000));
    const r = await withFallback(slow, () => ({ a: 0 }), 50);
    expect(r.dataSource).toBe("cached");
  });
});
