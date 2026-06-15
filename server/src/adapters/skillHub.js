import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { withFallback } from "./withFallback.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cacheDir = join(__dirname, "../cache");

function readCache(symbol) {
  return JSON.parse(readFileSync(join(cacheDir, `skills.${symbol}.json`), "utf-8"));
}

// Live call placeholder: when Bitget Skill Hub MCP/HTTP is wired, replace liveFn body.
async function liveSkills(_symbol) {
  throw new Error("live skills not configured"); // forces cached fallback until wired
}

export async function getSkills(symbol) {
  return withFallback(() => liveSkills(symbol), () => readCache(symbol));
}
