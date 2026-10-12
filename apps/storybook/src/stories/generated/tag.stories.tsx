import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/tag";
import { TagGroup } from "@lindaui/ui/tag-group";

const meta: Meta = { title: "Components/Tag" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<TagGroup aria-label="Tecnologías"><TagGroup.List><M.Tag id="react">React</M.Tag><M.Tag id="typescript">TypeScript</M.Tag></TagGroup.List></TagGroup>) };
