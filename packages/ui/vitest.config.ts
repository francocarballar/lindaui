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
  },
});
