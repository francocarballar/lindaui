import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";

const require = createRequire(new URL("./apps/storybook/package.json", import.meta.url));
const vite = join(dirname(require.resolve("vite/package.json")), "bin/vite.js");

export default {
  projectId: "lindaui",
  tests: ["tests/**/*.e2e.ts", "!tests/verona/**"],
  workers: 2,
  retries: 0,
  trace: "retain-on-failure",
  reporters: ["list", "junit", "markdown"],
  targets: [
    { name: "chromium", viewport: { width: 1280, height: 800 } },
    { name: "chromium-mobile", viewport: { width: 390, height: 844 } },
  ].map(({ name, viewport }) => ({
      name,
      engine: web({ browser: "chromium", viewport }),
      app: {
        url: "http://127.0.0.1:0",
        command: {
          executable: process.execPath,
          args: [vite, "preview", "--host", "127.0.0.1", "--port", "{port}", "--outDir", "storybook-static"],
          cwd: "apps/storybook",
          log: `.e2e/logs/${name}.log`,
        },
      },
    })),
} satisfies E2EConfig;
