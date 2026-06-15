export async function placeSimOrder({ symbol, side, size, price }) {
  // Sim execution: always succeeds, returns a synthetic fill.
  return { ok: true, symbol, side, size, fillPrice: price, ts: null, source: "agentHub-sim" };
}
