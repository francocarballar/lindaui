import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SaveBar } from "@lindaui/blocks/save-bar";
import { Input, Label, TextField } from "@lindaui/ui/compound";

const meta: Meta<typeof SaveBar> = {
  title: "Blocks/SaveBar",
  component: SaveBar,
  args: { dirty: true, saving: false, embedded: true, form: "preferences", labels: { pending: "Cambios sin guardar", upToDate: "Todo actualizado", submit: "Guardar cambios" } },
};
export default meta;
type Story = StoryObj<typeof SaveBar>;

export const Unsaved: Story = {};
export const UpToDate: Story = { args: { dirty: false } };
export const Saving: Story = { args: { saving: true } };

function ExternalForm() {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  return <div className="space-y-6">
    <form className="p-6" id="external-preferences" onChange={() => setDirty(true)} onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      setDirty(false);
      setSaving(false);
    }}><TextField><Label>Nombre</Label><Input defaultValue="Alex" /></TextField></form>
    <SaveBar dirty={dirty} embedded form="external-preferences" labels={{ pending: "Cambios sin guardar", upToDate: "Todo actualizado", submit: "Guardar cambios" }} saving={saving} />
  </div>;
}

export const ExternalFormSubmission: Story = { render: () => <ExternalForm /> };
