function template({ symbol, decision, risk }) {
  if (risk.verdict === "REJECT")
    return `Rejected ${decision.direction} ${symbol}: ${risk.vetoes.join(", ")}. Score ${decision.tradeScore}, R:R ${risk.rewardRiskRatio}, risk ${risk.riskLevel}.`;
  if (risk.verdict === "MODIFY")
    return `Modified ${decision.direction} ${symbol}: position cut for ${risk.vetoes.join(", ")}. Score ${decision.tradeScore}, risk ${risk.riskLevel}.`;
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
