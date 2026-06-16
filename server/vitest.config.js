import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Tests must be deterministic and offline: never hit the live Bitget API.
    env: { SKILLHUB_LIVE: "false" },
    testTimeout: 10000,
  },
});
