import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Dialog } from "@ts/ui/dialog";
import { Button } from "@ts/ui/button";

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setOpen(true)}>Abrir diálogo</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Título del diálogo"
        footer={
          <>
            <Button variant="ghost" onPress={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onPress={() => setOpen(false)}>
              Confirmar
            </Button>
          </>
        }
      >
        <p>Contenido del diálogo. ¿Confirmar la acción?</p>
      </Dialog>
    </>
  );
}

const meta: Meta<typeof DialogDemo> = { title: "Overlays/Dialog", component: DialogDemo };
export default meta;
type Story = StoryObj<typeof DialogDemo>;

export const Default: Story = {};
