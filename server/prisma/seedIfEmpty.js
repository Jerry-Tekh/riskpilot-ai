// Seeds the 90-day backtest only if the database is empty.
// Lets production restarts preserve live demo activity while guaranteeing
// a fresh deploy is never empty.
import { prisma } from "../src/db.js";

const count = await prisma.decision.count().catch(() => 0);
if (count > 0) {
  console.log(`Seed skipped — database already has ${count} decisions.`);
  await prisma.$disconnect();
  process.exit(0);
}
console.log("Empty database — running backtest seed…");
await prisma.$disconnect();
await import("./seed.js");
