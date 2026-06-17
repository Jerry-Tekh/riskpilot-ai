export function narrateTemplate({ symbol, decision, risk }) {
  return template({ symbol, decision, risk });
}

function template({ symbol, decision, risk }) {
  if (risk.verdict === "REJECT")
    return `Rejected ${decision.direction} ${symbol}: ${risk.vetoes.join(", ")}. Score ${decision.tradeScore}, R:R ${risk.rewardRiskRatio}, risk ${risk.riskLevel}.`;
  if (risk.verdict === "MODIFY")
    return `Modified ${decision.direction} ${symbol}: position cut for ${risk.vetoes.join(", ")}. Score ${decision.tradeScore}, risk ${risk.riskLevel}.`;
  if (risk.verdict === "HOLD")
    return `Holding flat on ${symbol}: no clear directional edge (score ${decision.tradeScore}, ${decision.confidence} confidence). Staying out is the disciplined call.`;
  return `Approved ${decision.direction} ${symbol}. Score ${decision.tradeScore} (${decision.confidence}), R:R ${risk.rewardRiskRatio}, SL ${risk.stopLoss}, TP ${risk.takeProfit}, risk ${risk.riskLevel}.`;
}

const SYSTEM = `You are RiskPilot, an autonomous risk-first crypto trading agent.
A deterministic engine has ALREADY decided the verdict (APPROVE / MODIFY / REJECT), the trade score, position size, stop-loss and take-profit. Your job is ONLY to explain that decision to the trader.
Rules:
- NEVER change the verdict, numbers, or direction. Explain what was decided, do not re-decide.
- Be concise: 2-3 sentences, confident and professional, like a risk desk analyst.
- Reference the concrete evidence (trend, RSI/MACD, volatility, funding, reward:risk, any vetoes).
- If REJECT or MODIFY, make the risk reasoning the focus — that judgment is the point.`;

async function liveNarrate(payload) {
  const key = process.env.QWEN_API_KEY;
  if (!key) throw new Error("no qwen key");
  const res = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.QWEN_MODEL || "qwen3.6-flash",
      temperature: 0.4,
      max_tokens: 160,
      enable_thinking: false, // ~23x fewer tokens + ~3x faster; we only need to explain, not reason
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`qwen ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || template(payload);
}

export async function narrate(payload, timeoutMs = 12000) {
  try {
    return await Promise.race([
      liveNarrate(payload),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
    ]);
  } catch {
    return template(payload);
  }
}

const DEEP_SYSTEM = `You are RiskPilot's senior market strategist. A deterministic risk engine has produced a verdict for a crypto trade. Write a structured deep-dive analysis (the engine's verdict is final — you explain and contextualize it, never override it).
Use this exact markdown structure with these headers:
## Market Read
## Signal Breakdown
## Risk Assessment
## Verdict Rationale
Be specific and quantitative — cite the trend, RSI, MACD, volatility, funding, reward:risk, and any vetoes by name. 4 short sections, ~2 sentences each. Professional desk-analyst tone.`;

async function liveDeep(payload) {
  const key = process.env.QWEN_API_KEY;
  if (!key) throw new Error("no qwen key");
  const res = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.QWEN_MODEL || "qwen3.6-flash",
      temperature: 0.5,
      max_tokens: 700,
      enable_thinking: true, // full reasoning ON — this is the deliberate "deep think" path
      messages: [
        { role: "system", content: DEEP_SYSTEM },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`qwen ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("empty");
  return { analysis: text, model: data.model || process.env.QWEN_MODEL, tokens: data.usage?.total_tokens ?? null };
}

export async function deepAnalyze(payload, timeoutMs = 40000) {
  return Promise.race([
    liveDeep(payload),
    new Promise((_, rej) => setTimeout(() => rej(new Error("deep analysis timed out")), timeoutMs)),
  ]);
}
