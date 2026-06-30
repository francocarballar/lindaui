import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageViewer } from "@lindaui/blocks/image-viewer";
import { Badge } from "@lindaui/ui/badge";

const meta: Meta<typeof ImageViewer> = {
  title: "Blocks/ImageViewer",
  component: ImageViewer,
};
export default meta;
type Story = StoryObj<typeof ImageViewer>;

export const Placeholder: Story = {
  render: () => (
    <div className="relative h-[480px] w-[480px] rounded-xl overflow-hidden">
      <ImageViewer
        placeholderLabel="NO HAY IMAGEN DISPONIBLE"
        showControls
      />
    </div>
  ),
};

export const WithImage: Story = {
  render: () => (
    <div className="relative h-[480px] w-[480px] rounded-xl overflow-hidden">
      <ImageViewer
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Computed_tomography_of_human_brain_-_large.png/250px-Computed_tomography_of_human_brain_-_large.png"
        alt="TC cerebral axial"
        caption="TC Cerebro · Axial · Serie 3 · Slice 12/48"
        showControls
      />
    </div>
  ),
};

export const WithAnnotations: Story = {
  render: () => (
    <div className="relative h-[480px] w-[480px] rounded-xl overflow-hidden">
      <ImageViewer
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Computed_tomography_of_human_brain_-_large.png/250px-Computed_tomography_of_human_brain_-_large.png"
        alt="RMN cerebral"
        caption="RMN Cerebro · Coronal · Serie 2 · Slice 7/24"
        showControls
        annotations={
          <div className="flex flex-col gap-1">
            <Badge variant="danger">URGENTE</Badge>
            <Badge variant="info">W:80 / L:40</Badge>
          </div>
        }
      />
    </div>
  ),
};

export const Dimmed: Story = {
  render: () => (
    <div className="relative h-[480px] w-[480px] rounded-xl overflow-hidden">
      <ImageViewer
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Computed_tomography_of_human_brain_-_large.png/250px-Computed_tomography_of_human_brain_-_large.png"
        alt="TC cerebral dimmed"
        caption="Grabando audio…"
        dim={0.75}
      />
    </div>
  ),
};
