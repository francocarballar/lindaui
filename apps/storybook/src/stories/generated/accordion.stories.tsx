import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/accordion";

const meta: Meta = { title: "Components/Accordion" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.Accordion><M.AccordionItem id="a"><M.AccordionHeading><M.AccordionTrigger>Sección 1</M.AccordionTrigger></M.AccordionHeading><M.AccordionPanel>Contenido de la sección 1.</M.AccordionPanel></M.AccordionItem></M.Accordion>) };
