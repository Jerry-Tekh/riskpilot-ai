# Publishing the RiskPilot Playbook

The package is authored and **passes local validation**. These steps upload it to
GetAgent Cloud, run a real backtest on Bitget's platform, and publish it to a
public marketplace link.

> **Network note:** the control plane is `https://api.bitget.com`. If your
> network/region blocks Bitget (the API times out), run these commands behind a
> VPN or from a cloud shell that can reach `api.bitget.com`. Your Bitget account
> region already determines this.

> **Your key:** the `ACCESS-KEY` is your **Playbook API Key** (from the Bitget
> Playbook page). Keep it out of any committed file.

Set it once in your shell (do not commit):
```bash
export PB_KEY="your-playbook-api-key"
```

### 1. Package + upload → get a draft id
```bash
cd playbook/riskpilot-adaptive-regime
tar czf ../riskpilot-adaptive-regime.tar.gz .
cd ..

curl -X POST \
  -H "ACCESS-KEY: $PB_KEY" \
  -F "package=@riskpilot-adaptive-regime.tar.gz" \
  "https://api.bitget.com/api/v1/playbook/upload"
# -> note the "draft_id" in the response
```

### 2. Run the backtest (async — poll until completed)
```bash
DRAFT_ID="<draft_id from step 1>"

curl -X POST -H "ACCESS-KEY: $PB_KEY" -H "Content-Type: application/json" \
  -d "{\"version_id\":\"$DRAFT_ID\"}" \
  "https://api.bitget.com/api/v1/playbook/run"
# -> note the "run_id", then poll:

RUN_ID="<run_id>"
curl -H "ACCESS-KEY: $PB_KEY" \
  "https://api.bitget.com/api/v1/playbook/run?run_id=$RUN_ID"
# repeat until "status":"completed" — read total_return_pct, sharpe_ratio,
# max_drawdown_pct, win_rate, total_trades. A real equity curve is required to publish.
```

### 3. Confirm the draft
```bash
curl -X POST -H "ACCESS-KEY: $PB_KEY" -H "Content-Type: application/json" \
  -d "{\"temporary_id\":\"$DRAFT_ID\"}" \
  "https://api.bitget.com/api/v1/playbook/confirm"
```

### 4. Publish
```bash
curl -X POST -H "ACCESS-KEY: $PB_KEY" -H "Content-Type: application/json" \
  -d "{\"draft_id\":\"$DRAFT_ID\",\"bump_type\":\"patch\"}" \
  "https://api.bitget.com/api/v1/playbook/publish"
# -> returns version_id + version + status:"published"
```

After publishing, the strategy appears on your GetAgent/Playbook page with a
public link and an official backtest snapshot. **Submit that link + the backtest
metrics with your hackathon entry**, and add the public Playbook URL to the
project description and the RiskPilot app footer.

---

### Easiest path
If you'd rather not run these by hand: paste your Playbook API Key into the chat
when asked and your coding agent (with the GetAgent skill installed) can drive
upload → run → confirm → publish for you, then report the backtest metrics and
the published link. The agent must be on a network that can reach
`api.bitget.com`.
