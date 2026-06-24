import type { Meta, StoryObj } from "@storybook/react";
import { Menu } from "@ts/ui/menu";

const items = [
  { key: "perfil", label: "Perfil", onAction: () => {} },
  { key: "ajustes", label: "Ajustes", onAction: () => {} },
  { key: "salir", label: "Cerrar sesión", isDanger: true, onAction: () => {} },
];

const meta: Meta<typeof Menu> = {
  title: "Overlays/Menu",
  component: Menu,
  args: { trigger: "Abrir menú", items },
};
export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {};

export const ConItemDeshabilitado: Story = {
  args: {
    items: [
      { key: "ver", label: "Ver", onAction: () => {} },
      { key: "editar", label: "Editar", isDisabled: true, onAction: () => {} },
      { key: "borrar", label: "Borrar", isDanger: true, onAction: () => {} },
    ],
  },
};
