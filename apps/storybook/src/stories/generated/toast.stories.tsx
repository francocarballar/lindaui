import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/toast";
import { useEffect } from "react";
import { Button } from "@lindaui/ui/button";
function ToastDemo() { useEffect(() => () => M.toastQueue.clear(), []); return <><M.ToastProvider /><Button onPress={() => M.toast.success("Cambios guardados", {description: "Tu información está actualizada.", timeout: 0})}>Guardar cambios</Button></>; }

const meta: Meta = { title: "Components/Toast" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<ToastDemo />) };
