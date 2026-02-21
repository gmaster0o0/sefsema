import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      reporter: ["text", "lcov", "html"],
      exclude: ["**/node_modules/**", "tests/**", ".next/**"],
    },
  },
});
