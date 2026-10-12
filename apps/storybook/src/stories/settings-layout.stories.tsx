import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Settings, User } from "lucide-react";
import { useState } from "react";
import { SettingsLayout } from "@lindaui/blocks/settings-layout";
import { SaveBar } from "@lindaui/blocks/save-bar";
import { Input, Label, TextField } from "@lindaui/ui/compound";

const sections = [
  { id: "profile", label: "Perfil", icon: <User aria-hidden="true" className="size-4 shrink-0" /> },
  { id: "notifications", label: "Notificaciones", icon: <Bell aria-hidden="true" className="size-4 shrink-0" /> },
  { id: "preferences", label: "Preferencias", icon: <Settings aria-hidden="true" className="size-4 shrink-0" /> },
] as const;
type Section = (typeof sections)[number]["id"];

function Preferences({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<Section>("profile");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <form id="storybook-preferences" onChange={() => setDirty(true)} onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 700));
      setDirty(false);
      setSaving(false);
    }}>
      <SettingsLayout
        compact={compact}
        footer={<SaveBar dirty={dirty} embedded form="storybook-preferences" labels={{ pending: "Cambios sin guardar", upToDate: "Todo actualizado", submit: "Guardar" }} saving={saving} />}
        idPrefix="storybook-preferences"
        navigationLabel="Secciones de configuración"
        onSelect={setSelected}
        panels={{
          profile: <TextField><Label>Nombre</Label><Input defaultValue="Alex" /></TextField>,
          notifications: <TextField><Label>Correo para avisos</Label><Input defaultValue="alex@example.com" /></TextField>,
          preferences: <TextField><Label>Idioma</Label><Input defaultValue="Español" /></TextField>,
        }}
        sections={sections}
        selected={selected}
        title={compact ? undefined : "Configuración"}
      />
    </form>
  );
}

const meta: Meta<typeof SettingsLayout> = {
  title: "Blocks/SettingsLayout",
  component: SettingsLayout,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SettingsLayout>;

export const PreserveUnsavedForms: Story = { render: () => <Preferences /> };
export const Compact: Story = { render: () => <div className="h-[620px]"><Preferences compact /></div> };
