import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/breadcrumbs";

const meta: Meta = { title: "Components/Breadcrumbs" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.Breadcrumbs><M.BreadcrumbsItem>Inicio</M.BreadcrumbsItem><M.BreadcrumbsItem>Sección</M.BreadcrumbsItem></M.Breadcrumbs>) };
