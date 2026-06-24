import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@ts/ui/scroll-shadow";

const meta: Meta = { title: "Components/ScrollShadow" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.ScrollShadow className="h-24 w-48"><div className="h-64 p-2">Contenido largo scrolleable para ver la sombra.</div></M.ScrollShadow>) };
