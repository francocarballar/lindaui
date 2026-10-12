import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/ui/tag-group";
import { Tag } from "@lindaui/ui/tag";
import { useState } from "react";
function TagsDemo() { const [tags, setTags] = useState(["React", "TypeScript", "LindaUI"]); return <M.TagGroup aria-label="Tecnologías" onRemove={keys => setTags(current => current.filter(tag => !keys.has(tag)))}><M.TagGroup.List>{tags.map(tag => <Tag key={tag} id={tag}>{tag}<Tag.RemoveButton /></Tag>)}</M.TagGroup.List></M.TagGroup>; }

const meta: Meta = { title: "Components/TagGroup" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<TagsDemo />) };
