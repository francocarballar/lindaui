import type { Meta, StoryObj } from "@storybook/react";
import * as M from "@lindaui/blocks/audio-player";

const meta: Meta = { title: "Components/AudioPlayer" };
export default meta;
type Story = StoryObj;

export const Default: Story = { render: () => (<div className="w-full max-w-xs"><M.AudioPlayer src="/audio/demo.wav" durationSeconds={5} /></div>) };
