import type { Meta, StoryObj } from "@storybook/react-vite";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCode } from "@lindaui/ui/qr-code";

const meta: Meta<typeof QRCode> = {
  title: "UI/QRCode",
  component: QRCode,
  args: { alt: "Código para vincular dispositivo", value: "lindaui-storybook-device-pairing" },
  decorators: [(Story) => <div className="w-fit rounded-xl bg-white p-3"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof QRCode>;

export const RawToken: Story = {};
export const AsciiArt: Story = {
  args: {
    value: "                             \n                             \n    █▀▀▀▀▀█  ▀▄ ▀ █▀▀▀▀▀█    \n    █ ███ █ █▄▀█▄ █ ███ █    \n    █ ▀▀▀ █   ▀▄  █ ▀▀▀ █    \n    ▀▀▀▀▀▀▀ ▀▄█ █ ▀▀▀▀▀▀▀    \n    ▄▄▄▀█ ▀▀ █▄▀    ▄▀▀      \n    █▄ ▀██▀▄█ ▀█▀█ █▄ █▀▀    \n          ▀ ▄▀  █▀▀▀▄█ ▄     \n    █▀▀▀▀▀█ ▀ ██ ▀▄▄█▄▄▄     \n    █ ███ █ █▀   ▄▀▄ ▀▄▀▀    \n    █ ▀▀▀ █  ▀ █ ▄▀▄▀████    \n    ▀▀▀▀▀▀▀  ▀▀ ▀  ▀▀        \n                             \n                             ",
    type: "ascii",
  },
};
export const SuppliedDataImage: Story = {
  args: {
    value: `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(
      <QRCode alt="Código para vincular dispositivo" value="lindaui-storybook-device-pairing" />,
    ).replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '))}`,
    type: "dataUrl",
  },
};
