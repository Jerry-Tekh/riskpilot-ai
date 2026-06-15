export async function withFallback(liveFn, cacheFn, timeoutMs = 4000) {
  try {
    const result = await Promise.race([
      liveFn(),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
    ]);
    return { ...result, dataSource: "live" };
  } catch {
    return { ...cacheFn(), dataSource: "cached" };
  }
}
