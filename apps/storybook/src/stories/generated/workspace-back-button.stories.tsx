import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/workspace-back-button";

const meta: Meta = { title: "Components/WorkspaceBackButton" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.WorkspaceBackButton href="#conversations" label="Volver a conversaciones" />) };
