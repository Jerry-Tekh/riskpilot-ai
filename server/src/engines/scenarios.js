// Stress-test scenarios: deterministically override the market context / portfolio
// so a judge can watch the risk engine's response on demand. Pure function.

export const SCENARIOS = {
  volatility_spike: { label: "Volatility Spike", desc: "Realized volatility explodes to extreme levels" },
  crowded_funding: { label: "Crowded Funding", desc: "Perp funding spikes while trend weakens — late longs" },
  drawdown_breach: { label: "Drawdown Breach", desc: "Account drawdown exceeds the hard risk limit" },
  bear_capitulation: { label: "Bear Capitulation", desc: "Trend, momentum and sentiment collapse together" },
  news_blackout: { label: "News Blackout", desc: "High-impact scheduled event imminent" },
};

export function applyScenario(ctx, portfolio, scenario) {
  const c = structuredClone(ctx);
  const p = structuredClone(portfolio);
  switch (scenario) {
    case "volatility_spike":
      c.volatility = { label: "Extreme", score: 96 };
      break;
    case "crowded_funding":
      c.funding = { label: "Crowded", score: 92 };
      c.trend = { label: "Bearish", score: 40 };
      break;
    case "drawdown_breach":
      p.drawdown = 0.25;
      break;
    case "bear_capitulation":
      c.trend = { label: "Bearish", score: 16 };
      c.momentum = { label: "Weak", score: 18 };
      c.sentiment = { label: "Extreme Fear", score: 8 };
      break;
    case "news_blackout":
      c.newsImpact = { ...(c.newsImpact || {}), label: "Blackout", score: 20, blackout: true };
      break;
    default:
      throw new Error(`unknown scenario: ${scenario}`);
  }
  return { ctx: c, portfolio: p };
}
