import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell, AppShellFooter } from "@lindaui/blocks/app-shell";
import type { AppShellProps } from "@lindaui/blocks/app-shell";
import { EntitySwitcher } from "@lindaui/blocks/entity-switcher";
import { Avatar, Button, Modal } from "@lindaui/ui/compound";
import { CalendarDays, LayoutDashboard, MessageCircle, Settings, Users } from "lucide-react";
import { useState } from "react";

const navItems = [
  { key: "overview", label: "Overview", href: "/overview", icon: LayoutDashboard },
  { key: "people", label: "People", href: "/people", icon: Users },
  { key: "messages", label: "Messages", href: "/messages", icon: MessageCircle, isCenterButton: true },
  { key: "calendar", label: "Calendar", href: "/calendar", icon: CalendarDays },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings },
];
const entities = [
  { identifier: "north", name: "North studio", description: "12 North Street" },
  { identifier: "south", name: "South studio", description: "34 South Street" },
];
const logoSrc = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#7c3aed"/><path d="M9 9h5v14H9zm9 0h5v14h-5z" fill="white"/></svg>')}`;

const meta: Meta<typeof AppShell> = {
  title: "Blocks/AppShell",
  component: AppShell,
  parameters: { layout: "fullscreen" },
  args: { brand: { label: "Workspace", href: "/overview", logoSrc }, navItems },
};
export default meta;
type Story = StoryObj<typeof AppShell>;

function ShellDemo(args: AppShellProps) {
  const [activeHref, setActiveHref] = useState("/messages");
  const [currentEntity, setCurrentEntity] = useState(entities[0]!);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [installable, setInstallable] = useState(true);
  const [status, setStatus] = useState("Connected");
  const label = args.navItems.find((item) => item.href === activeHref)?.label ?? "Overview";

  return (
    <>
      <AppShell
        {...args}
        navItems={args.navItems.map((item) => ({
          ...item, isActive: item.href === activeHref,
          onAction: item.key === "settings" ? () => setSettingsOpen(true) : undefined,
        }))}
        renderLink={(props) => <a {...props} onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented) { event.preventDefault(); setActiveHref(props.href); }
        }} />}
        headerRightSlot={<div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
          <Avatar className="h-7 w-7" size="sm"><Avatar.Fallback>AR</Avatar.Fallback></Avatar>
        </div>}
        sidebarTopSlot={(isCollapsed) => <EntitySwitcher
          currentEntity={currentEntity} entities={entities} onSelect={setCurrentEntity}
          isCollapsed={isCollapsed} isVisiting={args.isVisiting}
          labels={{ trigger: `Choose studio: ${currentEntity.name}`, menu: "Choose studio", section: "My studios", visiting: "Visiting" }}
        />}
        sidebarFooterSlot={(isCollapsed) => <AppShellFooter
          isCollapsed={isCollapsed} isConnected mounted theme={theme} isInstallable={installable}
          user={{ displayName: "Avery Rivera", avatarAlt: "Avery Rivera", initials: "AR" }}
          onInstall={() => { setInstallable(false); setStatus("App installed"); }}
          onToggleTheme={() => {
            const next = theme === "dark" ? "light" : "dark";
            setTheme(next);
            document.documentElement.classList.toggle("dark", next === "dark");
          }}
          onSignOut={async () => { setStatus("Signed out"); }}
        />}
        contentTopSlot={<div className="border-b border-border bg-surface-secondary px-4 py-2 text-sm" aria-live="polite">
          {args.isVisiting ? "You are visiting another workspace. " : ""}{status}
        </div>}
      >
        <div className="space-y-6 p-4 sm:p-6">
          <div><h1 className="font-semibold text-2xl">{label}</h1><p className="text-muted text-sm">{currentEntity.name} · Today's activity</p></div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[['Open conversations', '24'], ['New contacts', '8'], ['Appointments', '12']].map(([title, value]) => (
              <section className="rounded-lg border border-border bg-surface p-4" key={title}>
                <h2 className="text-muted text-sm">{title}</h2><p className="mt-2 font-semibold text-2xl">{value}</p>
              </section>
            ))}
          </div>
          <section className="rounded-lg border border-border bg-surface">
            <h2 className="border-b border-border p-4 font-semibold">Recent conversations</h2>
            {['Jordan Chen', 'Sam Patel', 'Taylor Morgan'].map((name, index) => (
              <div className="flex items-center gap-3 border-b border-border p-4 last:border-0" key={name}>
                <Avatar size="sm"><Avatar.Fallback>{name.charAt(0)}</Avatar.Fallback></Avatar>
                <div className="min-w-0 flex-1"><p className="font-medium text-sm">{name}</p><p className="truncate text-muted text-sm">{index === 0 ? 'Can we schedule a visit this week?' : 'Thanks for the information.'}</p></div>
                <span className="text-muted text-xs">{index + 1}h ago</span>
              </div>
            ))}
          </section>
        </div>
      </AppShell>
      <Modal.Backdrop isOpen={settingsOpen} onOpenChange={setSettingsOpen}>
        <Modal.Container><Modal.Dialog>
          <Modal.Header><Modal.Heading>Workspace settings</Modal.Heading></Modal.Header>
          <Modal.Body><p>Navigation actions can open a dialog instead of changing the route.</p></Modal.Body>
          <Modal.Footer><Button onPress={() => setSettingsOpen(false)}>Done</Button></Modal.Footer>
        </Modal.Dialog></Modal.Container>
      </Modal.Backdrop>
    </>
  );
}

export const Desktop: Story = { render: (args) => <ShellDemo {...args} /> };
export const Collapsed: Story = { args: { defaultCollapsed: true }, render: (args) => <ShellDemo {...args} /> };
export const Visiting: Story = { args: { isVisiting: true }, render: (args) => <ShellDemo {...args} /> };
export const MobileFloatingNavigation: Story = {
  parameters: { viewport: { options: { phone: { name: "Phone · 390 × 844", styles: { width: "390px", height: "844px" }, type: "mobile" } } } },
  globals: { viewport: { value: "phone", isRotated: false } },
  render: (args) => <ShellDemo {...args} />,
};
export const MobileSimpleNavigation: Story = {
  args: { navItems: navItems.filter((item) => !item.isCenterButton) },
  parameters: { viewport: { options: { phone: { name: "Phone · 390 × 844", styles: { width: "390px", height: "844px" }, type: "mobile" } } } },
  globals: { viewport: { value: "phone", isRotated: false } },
  render: (args) => <ShellDemo {...args} />,
};
