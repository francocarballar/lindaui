import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/disclosure-group";
import { Disclosure, DisclosureHeading, DisclosureTrigger, DisclosureContent } from "@lindaui/ui/disclosure";

const meta: Meta = { title: "Components/DisclosureGroup" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.DisclosureGroup><Disclosure id="shipping"><DisclosureHeading><DisclosureTrigger>Envíos</DisclosureTrigger></DisclosureHeading><DisclosureContent>Entregamos en todo el país.</DisclosureContent></Disclosure><Disclosure id="returns"><DisclosureHeading><DisclosureTrigger>Devoluciones</DisclosureTrigger></DisclosureHeading><DisclosureContent>Podés devolver tu pedido dentro de 30 días.</DisclosureContent></Disclosure></M.DisclosureGroup>) };
