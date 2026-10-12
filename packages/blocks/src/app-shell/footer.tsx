"use client";

import { Avatar, Button, Tooltip } from "@lindaui/ui/compound";
import { cn } from "@lindaui/ui/cn";
import { Download, LogOut, Moon, Sun, Wifi, WifiOff } from "lucide-react";
import { useLogoutDialog } from "./logout-dialog";

export interface AppShellUser {
  displayName?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  initials?: string;
}

export interface AppShellFooterLabels {
  connected: string;
  disconnected: string;
  installApp: string;
  lightTheme: string;
  darkTheme: string;
  lightThemeTooltip: string;
  darkThemeTooltip: string;
  logoutTrigger: string;
  logoutTitle: string;
  logoutDescription: string;
  logoutCancel: string;
  logoutConfirm: string;
  logoutPending: string;
  logoutError: string;
}

export interface AppShellFooterProps {
  className?: string;
  isCollapsed?: boolean;
  isConnected?: boolean;
  showConnectionStatus?: boolean;
  isInstallable?: boolean;
  onInstall?: () => void;
  mounted?: boolean;
  theme?: string;
  onToggleTheme?: () => void;
  user?: AppShellUser | null;
  onSignOut: () => void | Promise<void>;
  labels?: Partial<AppShellFooterLabels>;
}

const defaultLabels: AppShellFooterLabels = {
  connected: "Connected",
  disconnected: "Disconnected",
  installApp: "Install app",
  lightTheme: "Light mode",
  darkTheme: "Dark mode",
  lightThemeTooltip: "Light mode",
  darkThemeTooltip: "Dark mode",
  logoutTrigger: "Sign out",
  logoutTitle: "Sign out?",
  logoutDescription: "You will need to sign in again to access your account.",
  logoutCancel: "Cancel",
  logoutConfirm: "Sign out",
  logoutPending: "Signing out…",
  logoutError: "Unable to sign out. Please try again.",
};

/** Connection, installation, theme and account actions; all business effects are injected. */
export function AppShellFooter({
  className, isCollapsed = false, isConnected = false, showConnectionStatus = true,
  isInstallable = false, onInstall, mounted = false, theme, onToggleTheme, user,
  onSignOut, labels: labelOverrides,
}: AppShellFooterProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const logout = useLogoutDialog(onSignOut, labels);
  const statusLabel = isConnected ? labels.connected : labels.disconnected;
  const themeLabel = theme === "dark" ? labels.lightTheme : labels.darkTheme;
  const themeTooltip = theme === "dark" ? labels.lightThemeTooltip : labels.darkThemeTooltip;

  return (
    <div className={cn("space-y-2 border-border border-t px-2 py-4", className)}>
      {showConnectionStatus ? (
        isCollapsed ? (
          <Tooltip>
            <Tooltip.Trigger aria-label={statusLabel}>
              <div className={cn(
                "mx-1 flex justify-center rounded-lg py-2",
                isConnected ? "bg-success/10" : "bg-danger/10"
              )}>
                {isConnected ? <Wifi className="text-success" size={16} /> : <WifiOff className="text-danger" size={16} />}
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content placement="right">{statusLabel}</Tooltip.Content>
          </Tooltip>
        ) : (
          <div className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5",
            isConnected ? "bg-success/10" : "bg-danger/10"
          )}>
            {isConnected ? (
              <><Wifi className="text-success" size={16} /><span className="font-medium text-success text-xs">{statusLabel}</span></>
            ) : (
              <><WifiOff className="text-danger" size={16} /><span className="font-medium text-danger text-xs">{statusLabel}</span></>
            )}
          </div>
        )
      ) : null}

      {isInstallable && !isCollapsed ? (
        <Button className="w-full text-xs" onPress={onInstall} size="sm" variant="tertiary">
          <Download size={14} />{labels.installApp}
        </Button>
      ) : null}

      {mounted ? (
        isCollapsed ? (
          <Tooltip>
            <Tooltip.Trigger>
              <Button
                aria-label={themeTooltip}
                className="w-full text-muted hover:text-foreground"
                isIconOnly onPress={onToggleTheme} size="sm" variant="ghost"
              >{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</Button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="right">{themeTooltip}</Tooltip.Content>
          </Tooltip>
        ) : (
          <Button className="w-full text-xs" onPress={onToggleTheme} size="sm" variant="tertiary">
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}{themeLabel}
          </Button>
        )
      ) : null}

      {isCollapsed ? (
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              aria-label={labels.logoutTrigger}
              className="w-full text-muted hover:text-danger"
              isIconOnly onPress={logout.open} size="sm" variant="ghost"
            ><LogOut size={16} /></Button>
          </Tooltip.Trigger>
          <Tooltip.Content placement="right">{labels.logoutTrigger}</Tooltip.Content>
        </Tooltip>
      ) : (
        <div className="flex items-center gap-2 px-2">
          <Avatar className="flex-shrink-0" color="default" size="sm">
            <Avatar.Image alt={user?.avatarAlt ?? ""} src={user?.avatarSrc} />
            <Avatar.Fallback>{user?.initials}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-xs">{user?.displayName}</p>
          </div>
          <Button
            aria-label={labels.logoutTrigger}
            className="text-muted hover:text-danger"
            isIconOnly onPress={logout.open} size="sm" variant="ghost"
          ><LogOut size={14} /></Button>
        </div>
      )}
      {logout.dialog}
    </div>
  );
}
