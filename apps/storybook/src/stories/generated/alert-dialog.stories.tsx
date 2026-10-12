import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/alert-dialog";
import { useState } from "react";
import { Button } from "@lindaui/ui/button";
function AlertDemo() { const [open, setOpen] = useState(false); const [confirmed, setConfirmed] = useState(false); return <><Button onPress={() => setOpen(true)}>Eliminar registro</Button><M.AlertDialog open={open} onClose={() => setOpen(false)} onConfirm={() => { setConfirmed(true); setOpen(false); }} title="¿Eliminar registro?" description="Esta acción elimina el registro seleccionado." confirmLabel="Eliminar" cancelLabel="Cancelar" isDestructive /><output role="status">{confirmed ? "Registro eliminado" : "Registro conservado"}</output></>; }

const meta: Meta = { title: "Components/AlertDialog" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<AlertDemo />) };
