import "dotenv/config";
import { defineConfig } from "vitest/config";

process.env.VITEST = "true";

export default defineConfig({
  test: {
    // fileParallelism: false, // Database tests shouldn't be parallel?
    reporters: process.env.GITHUB ? ["github-actions", "verbose"] : "basic",
    coverage: {
      provider: "v8", // Istanbul doesn't work because express was written in CommonJS. Fuck CommonJS.
      reportsDirectory: "coverage",
      reporter: process.env.GITHUB ? [["text", { file: "coverage.txt" }]] : "text",
    },
  }
});
