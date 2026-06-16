// Lightweight telemetry. Session counters (in-memory) + persistent totals (from DB).
// Satisfies the hackathon "verifiable usage evidence (API call volume)" baseline.

const session = {
  startedAt: Date.now(),
  agentLoops: 0,      // full perceive→decide→execute runs this session
  bitgetApiCalls: 0,  // successful live Bitget HTTP calls this session
  liveHits: 0,        // perception served from live data
  cacheHits: 0,       // perception served from cache fallback
};

export function recordLoop() { session.agentLoops++; }
export function recordBitgetCall() { session.bitgetApiCalls++; }
export function recordSource(src) { src === "live" ? session.liveHits++ : session.cacheHits++; }

export async function getMetrics(prisma) {
  const [decisions, rejections, modifies, approvals, trades, monitorCloses, positions] = await Promise.all([
    prisma.decision.count(),
    prisma.decision.count({ where: { verdict: "REJECT" } }),
    prisma.decision.count({ where: { verdict: "MODIFY" } }),
    prisma.decision.count({ where: { verdict: "APPROVE" } }),
    prisma.trade.count(),
    prisma.trade.count({ where: { source: "monitor" } }),
    prisma.position.count(),
  ]);
  return {
    totals: { decisions, approvals, modifies, rejections, trades, monitorCloses, positions },
    session: {
      ...session,
      uptimeSec: Math.round((Date.now() - session.startedAt) / 1000),
    },
  };
}
