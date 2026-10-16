import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";

const require = createRequire(new URL("./apps/verona/package.json", import.meta.url));
const next = join(dirname(require.resolve("next/package.json")), "dist/bin/next");

export default {
  projectId: "lindaui-verona",
  tests: ["tests/verona/**/*.e2e.ts"],
  workers: 2,
  retries: 0,
  trace: "retain-on-failure",
  reporters: ["list", "junit", "markdown"],
  targets: [
    { name: "verona-chromium", viewport: { width: 1280, height: 800 } },
    { name: "verona-mobile", viewport: { width: 390, height: 844 } },
  ].map(({ name, viewport }) => ({
    name,
    engine: web({ browser: "chromium", locale: "en-US", viewport }),
    app: {
      url: "http://127.0.0.1:0",
      command: {
        executable: process.execPath,
        args: [next, "start", "--hostname", "127.0.0.1", "--port", "{port}"],
        cwd: "apps/verona",
        log: `.e2e/logs/${name}.log`,
      },
    },
  })),
} satisfies E2EConfig;
