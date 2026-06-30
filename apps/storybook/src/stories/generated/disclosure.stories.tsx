import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/disclosure";

const meta: Meta = { title: "Components/Disclosure" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.Disclosure><M.DisclosureHeading><M.DisclosureTrigger>Ver más</M.DisclosureTrigger></M.DisclosureHeading><M.DisclosureContent>Detalle revelado.</M.DisclosureContent></M.Disclosure>) };
