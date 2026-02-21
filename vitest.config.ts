import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reporter: ["text", "lcov", "html"],
      exclude: [
        // Default excludes
        "**/node_modules/**",
        ".next/**",
        "dist/**",
        "build/**",

        // Test files
        "tests/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",

        // Configuration files
        "**/*.config.js",
        "**/*.config.ts",
        "**/*.config.cjs",
        "**/*.config.mjs",
        "*.json",
        "**/.*.js", // Hidden config files like .eslintrc.js

        // Next.js specific framework files
        "**/layout.tsx",
        "**/error.tsx",
        "**/loading.tsx",
        "**/not-found.tsx",
        "**/template.tsx",
        "next-env.d.ts",

        // Type declaration files
        "**/*.d.ts",

        // Coverage output directory
        "coverage/**",
      ],
    },
  },
});
