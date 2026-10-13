import { readFileSync } from "node:fs";
import { test } from "@e2e-dev/web";
import { expect } from "e2e";

// Collect from the built catalog so new stories cannot silently miss the gate.
const index = JSON.parse(readFileSync(new URL("../apps/storybook/storybook-static/index.json", import.meta.url), "utf8")) as {
  entries: Record<string, { id: string; title: string; name: string; type: string }>;
};
const stories = Object.values(index.entries).filter((entry) => entry.type === "story").sort((a, b) => a.id.localeCompare(b.id));
if (!stories.length) throw new Error("Empty Storybook catalog. Run pnpm test:e2e:build first.");

for (const story of stories) {
  test(`${story.title} / ${story.name} renders`, async ({ app, browser }) => {
    await browser.addInitScript(() => {
      const errors: string[] = [];
      (window as Window & { __lindaErrors?: string[] }).__lindaErrors = errors;
      window.addEventListener("error", (event) => errors.push(event.message));
      window.addEventListener("unhandledrejection", (event) => errors.push(String(event.reason)));
    });
    // Storybook lazy-loads story modules after the document load event. Wait
    // for those requests before asserting visibility; navigate once, no retries.
    const url = new URL(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`, app.baseUrl);
    await browser.goto(url.href, { waitUntil: "networkidle" });
    await expect(browser.locator("#storybook-root")).toBeVisible();
    await expect(browser.locator(".sb-errordisplay")).toBeHidden();
    expect(await browser.evaluate(() => (window as Window & { __lindaErrors?: string[] }).__lindaErrors ?? [])).toEqual([]);
  });
}
