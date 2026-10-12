import * as HeroUI from "@heroui/react";
import * as FramerMotion from "framer-motion";
import * as Recharts from "recharts";
import { toast, Toaster, useSonner } from "sonner";
import { describe, expect, it } from "vitest";
import * as Compound from "./compound";
import * as Charts from "./charts";
import * as Motion from "./motion";
import * as Notifications from "./notifications";

describe("opt-in visual integration entries", () => {
  it("preserves every original HeroUI runtime export and its identity", () => {
    expect(Object.keys(Compound).sort()).toEqual(Object.keys(HeroUI).sort());
    for (const name of Object.keys(HeroUI) as Array<keyof typeof HeroUI>) {
      expect(Compound[name]).toBe(HeroUI[name]);
    }
    expect(Compound.Card.Content).toBe(HeroUI.Card.Content);
    expect(Compound.Tabs.Panel).toBe(HeroUI.Tabs.Panel);
    expect(Compound.Modal.Dialog).toBe(HeroUI.Modal.Dialog);
  });

  it("shares motion, notification and chart implementations without wrappers", () => {
    expect(Motion.motion).toBe(FramerMotion.motion);
    expect(Motion.AnimatePresence).toBe(FramerMotion.AnimatePresence);
    expect(Notifications.toast).toBe(toast);
    expect(Notifications.Toaster).toBe(Toaster);
    expect(Notifications.useSonner).toBe(useSonner);
    expect(Charts.AreaChart).toBe(Recharts.AreaChart);
    expect(Charts.ResponsiveContainer).toBe(Recharts.ResponsiveContainer);
  });
});
