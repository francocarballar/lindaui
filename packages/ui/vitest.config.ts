import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
    // Turbo runs multiple suites/builds together; bound jsdom workers, not test timeouts.
    maxWorkers: 2,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.*", "src/**/*.stories.*", "src/test-setup.ts", "src/**/*.d.ts"],
      reporter: ["text", "json", "json-summary", "html", "lcov"],
      thresholds: { perFile: true, lines: 100, statements: 100, functions: 100, branches: 100 },
    },
  },
});
