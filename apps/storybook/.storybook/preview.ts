import "@ts/tokens/css";
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "var(--surface)" },
        { name: "dark", value: "#0f0f0f" },
      ],
    },
  },
};

export default preview;
