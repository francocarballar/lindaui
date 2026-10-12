import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShellFooter } from "@lindaui/blocks/app-shell";
import { useState } from "react";

const meta: Meta<typeof AppShellFooter> = {
  title: "Blocks/AppShellFooter",
  component: AppShellFooter,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof AppShellFooter>;

function FooterDemo({ collapsed = false, connected = true, failFirst = false }) {
  const [theme, setTheme] = useState("light");
  const [isInstallable, setInstallable] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState("Account actions are interactive.");
  return (
    <div className="space-y-4">
      <div className={`${collapsed ? "w-16" : "w-48"} border border-border bg-background`}>
        <AppShellFooter
          isCollapsed={collapsed} isConnected={connected} isInstallable={isInstallable}
          mounted theme={theme} user={{ displayName: "Avery Rivera", avatarAlt: "Avery Rivera", initials: "AR" }}
          onInstall={() => { setInstallable(false); setStatus("App installed"); }}
          onToggleTheme={() => {
            const next = theme === "dark" ? "light" : "dark";
            setTheme(next);
            document.documentElement.classList.toggle("dark", next === "dark");
            setStatus(`Theme changed to ${next}`);
          }}
          onSignOut={async () => {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setAttempts(attempts + 1);
            if (failFirst && attempts === 0) throw new Error("Simulated unavailable service");
            setStatus("Signed out successfully");
          }}
        />
      </div>
      <p aria-live="polite" className="max-w-xs text-muted text-sm">{status}</p>
    </div>
  );
}

export const Expanded: Story = { render: () => <FooterDemo /> };
export const Collapsed: Story = { render: () => <FooterDemo collapsed /> };
export const Disconnected: Story = { render: () => <FooterDemo connected={false} /> };
export const LogoutRetry: Story = { render: () => <FooterDemo failFirst /> };
