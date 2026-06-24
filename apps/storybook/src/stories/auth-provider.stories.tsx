import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuthProvider, useAuth } from "@ts/blocks/auth-provider";

const meta: Meta = {
  title: "Blocks/AuthProvider",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

function UserCard() {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 w-[320px] text-center">
        <p className="text-sm text-muted-foreground">No hay sesión activa.</p>
        <p className="mt-1 text-xs text-muted-foreground font-mono">user === null</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-6 w-[320px] flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
          {(user.name ?? "U").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold">{user.name ?? "Usuario"}</p>
          {user.role != null && (
            <p className="text-xs text-muted-foreground">{String(user.role)}</p>
          )}
        </div>
      </div>
      <div className="rounded-lg bg-secondary p-3">
        <pre className="text-xs text-muted-foreground overflow-auto">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}

export const LoggedIn: Story = {
  render: () => (
    <AuthProvider user={{ name: "Dr. Martínez, Ricardo", role: "Radiólogo", id: "usr_001", institution: "Clínica del Sol" }}>
      <UserCard />
    </AuthProvider>
  ),
};

export const LoggedOut: Story = {
  render: () => (
    <AuthProvider user={null}>
      <UserCard />
    </AuthProvider>
  ),
};

export const MinimalUser: Story = {
  render: () => (
    <AuthProvider user={{ name: "Dra. Romero, Patricia" }}>
      <UserCard />
    </AuthProvider>
  ),
};

export const AnonymousUser: Story = {
  render: () => (
    <AuthProvider user={{}}>
      <UserCard />
    </AuthProvider>
  ),
};
