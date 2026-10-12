import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/fetching-indicator";

const meta: Meta = { title: "Components/FetchingIndicator" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<M.FetchingIndicator label="Actualizando conversaciones…" />) };
