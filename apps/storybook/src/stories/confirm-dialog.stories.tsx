import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Send, CheckCircle, Trash2, UserX } from "lucide-react";
import { ConfirmDialog } from "@ts/blocks/confirm-dialog";
import { Button } from "@ts/ui/button";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Blocks/ConfirmDialog",
  component: ConfirmDialog,
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onPress={() => setOpen(true)}>Enviar informe</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => { setOpen(false); alert("Enviado!"); }}
          title="Enviar informe al médico solicitante"
          description="El informe se enviará de forma permanente al Dr. Martínez. Esta acción no se puede deshacer."
          confirmLabel="Enviar"
          cancelLabel="Cancelar"
          icon={<Send className="h-5 w-5" />}
        />
      </>
    );
  },
};

export const WithIcon: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onPress={() => setOpen(true)}>Firmar estudio</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => { setOpen(false); }}
          title="Firmar informe radiológico"
          description="Al firmar el informe confirmás que revisaste y aprobás el diagnóstico. El estado del estudio pasará a FIRMADO."
          confirmLabel="Firmar"
          icon={<CheckCircle className="h-5 w-5" />}
        />
      </>
    );
  },
};

export const NoDescription: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="ghost" onPress={() => setOpen(true)}>Confirmar acción</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => setOpen(false)}
          title="¿Confirmar esta acción?"
          confirmLabel="Sí, continuar"
        />
      </>
    );
  },
};

export const Destructive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onPress={() => setOpen(true)}>Eliminar estudio</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => { setOpen(false); alert("Eliminado!"); }}
          title="Eliminar estudio de imágenes"
          description="Esta acción eliminará permanentemente el estudio y todos sus archivos asociados. No podrás recuperarlos."
          confirmLabel="Eliminar"
          destructive
          icon={<Trash2 className="h-5 w-5" />}
        />
      </>
    );
  },
};

export const DestructiveWithIdentity: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="danger" onPress={() => setOpen(true)}>Dar de baja paciente</Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => { setOpen(false); }}
          title="Dar de baja al paciente del sistema"
          description="Se eliminará la cuenta y todos los estudios vinculados. Esta acción es irreversible."
          confirmLabel="Dar de baja"
          destructive
          icon={<UserX className="h-5 w-5" />}
          identity={{ name: "García Pérez, María" }}
        />
      </>
    );
  },
};
