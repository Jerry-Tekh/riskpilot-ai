import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const api = axios.create({ baseURL });

export const getHealth = () => api.get("/api/health").then((r) => r.data);
export const runLoop = (command) => api.post("/api/agent/run", { command }).then((r) => r.data);
export const analyze = (symbol) => api.post("/api/agent/analyze", { symbol }).then((r) => r.data);
export const getMarket = (symbol) => api.get(`/api/market/${symbol}`).then((r) => r.data);
export const getPositions = (status) => api.get("/api/positions", { params: { status } }).then((r) => r.data);
export const getTrades = () => api.get("/api/trades").then((r) => r.data);
export const getPortfolio = () => api.get("/api/portfolio/summary").then((r) => r.data);
export const getPortfolioHistory = () => api.get("/api/portfolio/history").then((r) => r.data);
export const getDecisions = () => api.get("/api/decisions").then((r) => r.data);
export const getStats = () => api.get("/api/stats").then((r) => r.data);
