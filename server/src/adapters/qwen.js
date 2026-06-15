function template({ symbol, decision, risk }) {
  if (risk.verdict === "REJECT")
    return `Rejected ${decision.direction} ${symbol}: ${risk.vetoes.join(", ")}. Score ${decision.tradeScore}, R:R ${risk.rewardRiskRatio}, risk ${risk.riskLevel}.`;
  if (risk.verdict === "MODIFY")
    return `Modified ${decision.direction} ${symbol}: position cut for ${risk.vetoes.join(", ")}. Score ${decision.tradeScore}, risk ${risk.riskLevel}.`;
  return `Approved ${decision.direction} ${symbol}. Score ${decision.tradeScore} (${decision.confidence}), R:R ${risk.rewardRiskRatio}, SL ${risk.stopLoss}, TP ${risk.takeProfit}, risk ${risk.riskLevel}.`;
}

async function liveNarrate(payload) {
  const key = process.env.QWEN_API_KEY;
  if (!key) throw new Error("no qwen key");
  const res = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.QWEN_MODEL || "qwen3.6-plus",
      messages: [
        { role: "system", content: "You are RiskPilot, a risk-first trading agent. Explain the verdict in 2-3 sentences. Never change the verdict or numbers." },
        { role: "user", content: JSON.stringify(payload) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`qwen ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || template(payload);
}

export async function narrate(payload, timeoutMs = 6000) {
  try {
    return await Promise.race([
      liveNarrate(payload),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
    ]);
  } catch {
    return template(payload);
  }
}
