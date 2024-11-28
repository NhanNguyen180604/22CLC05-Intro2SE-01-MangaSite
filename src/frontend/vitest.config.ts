import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";
import config from "./vite.config.js";

export default mergeConfig(
  config,
  defineConfig({
    test: {
      mockReset: false,
      css: true,
      coverage: {
        provider: "istanbul",
        reporter: "text",
      },
      setupFiles: ["./src/tests/vitest-setup.ts"],
      browser: {
        provider: "playwright",
        name: "chromium",
        enabled: true,
        headless: true,
        screenshotFailures: false,
      },
    },
  }),
);
