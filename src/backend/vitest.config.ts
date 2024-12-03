import "dotenv/config";
import { defineConfig } from "vitest/config";

process.env.VITEST = "true";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8", // Istanbul doesn't work because express was written in CommonJS. Fuck CommonJS.
      reporter: ["text"],
    },
  }
});
