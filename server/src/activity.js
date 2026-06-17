// In-memory ring buffer of recent agent actions — powers the live activity feed.
const MAX = 80;
let seq = 0;
const events = [];

// type: perceive | decision | execute | reject | monitor | autopilot | risk
export function recordActivity(type, message, meta = {}) {
  events.unshift({ id: ++seq, type, message, meta, at: Date.now() });
  if (events.length > MAX) events.pop();
}

export function getActivity(limit = 50) {
  return events.slice(0, limit);
}
