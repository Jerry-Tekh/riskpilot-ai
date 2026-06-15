# Deployment Guide

RiskPilot AI deploys as two pieces: the **Express API + PostgreSQL** (Railway or Render) and the **React frontend** (Vercel or Netlify). One public URL for judges.

---

## 1. Backend + Database — Railway (recommended)

1. Create a new Railway project → **Add PostgreSQL** plugin. Copy its `DATABASE_URL`.
2. **Add a service from your GitHub repo**, root directory `server/`.
3. Set environment variables on the service:
   ```
   DATABASE_URL=<from Railway Postgres>
   PORT=4000
   QWEN_API_KEY=<your Alibaba/Qwen key, optional>
   QWEN_BASE_URL=https://hackathon.bitgetops.com/v1
   QWEN_MODEL=qwen3.6-plus
   MONITOR_INTERVAL_MS=30000
   ```
4. Set the **build command**: `npm install && npx prisma generate`
5. Set the **start command**: `npx prisma migrate deploy && npm start`
6. After first deploy, run the seed once (Railway shell or a one-off command):
   ```
   npm run seed
   ```
   This populates 90 days of simulated trading evidence so the app is never empty.
7. Confirm `https://<your-api>.up.railway.app/api/health` returns `{"status":"ok"}`.

> **Render alternative:** Create a Web Service (root `server/`, build `npm install && npx prisma generate`, start `npx prisma migrate deploy && npm start`) and a managed PostgreSQL instance; wire `DATABASE_URL`. Run `npm run seed` once via the Render shell.

---

## 2. Frontend — Vercel (recommended)

1. Import the repo into Vercel. Set **Root Directory** to `web/`.
2. Framework preset: **Vite**. Build command `npm run build`, output `dist`.
3. Environment variable:
   ```
   VITE_API_URL=https://<your-api>.up.railway.app
   ```
4. Deploy. Vercel gives you the public demo URL to submit.

> **Netlify alternative:** Base directory `web/`, build `npm run build`, publish `dist`, env `VITE_API_URL` set to the API URL.

---

## 3. Smoke Test (do this before submitting)

On the **public** frontend URL:

- [ ] `Console`: run `Trade BTC using current conditions` → loop steps animate → **APPROVE**, position opens
- [ ] `Console`: run `Trade DOGE` → **REJECT** with veto reasons
- [ ] `Market`: switch BTC/ETH/DOGE; signal gauges render; data-source badge shows
- [ ] `Risk Center`: drawdown chart + open positions render
- [ ] `Trade Log`: stats header populated; equity curve renders; at least one `monitor` row present
- [ ] API: `GET /api/health` returns `{"status":"ok"}`
- [ ] API: `GET /api/stats` returns non-zero `trades`

---

## Notes

- The app runs fully without a `QWEN_API_KEY` (deterministic template narration). Add the key to enable LLM-written explanations.
- All external integrations use live-first/cached fallback, so a third-party outage during judging will not break the demo.
- CORS is open on the API for hackathon simplicity; restrict to the frontend origin for production.
