import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));
const builder = fileURLToPath(new URL("../packages/tokens/scripts/build-css.mjs", import.meta.url));
const outputs = ["index", "lead-converter"].map((name) => ({
  name,
  file: new URL(`../packages/tokens/dist/${name}.css`, import.meta.url),
}));
const build = () => exec(process.execPath, [builder], { cwd: root, timeout: 60_000 });

function validate(name, css) {
  assert(css.length > 50_000, `${name}: CSS must be complete, not truncated`);
  for (const marker of ["--field-background", "--accent", ...(name === "index"
    ? [".bg-primary", "@keyframes ti-rec-pulse"]
    : [".flex", ".notice-action.button--primary", "oklch(0.541 0.281 293.009)", "oklch(0.606 0.25 292.717)"])]) {
    assert(css.includes(marker), `${name}: missing ${marker}`);
  }
}

test("two independent token builders exit 0 and only publish complete byte-identical CSS", { timeout: 120_000 }, async () => {
  await build();
  const before = outputs.map(({ name, file }) => {
    const css = readFileSync(file, "utf8");
    validate(name, css);
    return css;
  });
  const observations = [];
  const monitor = setInterval(() => {
    try {
      outputs.forEach(({ name, file }, i) => {
        const css = readFileSync(file, "utf8");
        validate(name, css);
        assert.equal(css, before[i], `${name}: readers must not observe partial output`);
      });
    } catch (error) {
      observations.push(error);
    }
  }, 5);
  let results;
  try {
    results = await Promise.allSettled([build(), build()]);
  } finally {
    clearInterval(monitor);
  }
  for (const [i, result] of results.entries()) {
    assert.equal(result.status, "fulfilled", `builder ${i + 1}: ${result.reason?.stderr ?? result.reason ?? ""}`);
  }
  assert.deepEqual(observations, [], "public outputs were missing, empty or partial during compilation");
  outputs.forEach(({ name, file }, i) => {
    const css = readFileSync(file, "utf8");
    validate(name, css);
    assert.equal(css, before[i], `${name}: concurrent compilation changed the CSS bytes`);
  });
});
