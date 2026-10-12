import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    maxWorkers: 2,
    coverage: {
      provider: 'v8',
      include: ['app/**/*.{ts,tsx}', 'layout/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'types/**/*.ts'],
      exclude: ['**/*.test.*', '**/*.d.ts'],
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      thresholds: { perFile: true, lines: 100, statements: 100, functions: 100, branches: 100 },
    },
  },
  resolve: {
    alias: { '@': new URL('.', import.meta.url).pathname }
  }
});
