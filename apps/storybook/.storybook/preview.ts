import "@lindaui/tokens/css";
import "./preview.css";
import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  // Autodocs global: cada componente/block obtiene una página "Docs" que junta
  // todas sus variantes en una vista (como el storybook de HeroUI).
  tags: ["autodocs"],

  // Toggle real de tema en la toolbar: agrega/quita la clase `.dark` en <html>,
  // que es lo que consume @lindaui/tokens. Sin esto, el "dark" solo oscurecía el
  // fondo pero los tokens seguían en light → texto sin contraste.
  globalTypes: {
    theme: {
      description: "Modo claro / oscuro",
      defaultValue: "light",
      toolbar: {
        title: "Tema",
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      if (typeof document !== "undefined") {
        const dark = context.globals.theme === "dark";
        document.documentElement.classList.toggle("dark", dark);
        document.body.style.background = "var(--background)";
        document.body.style.color = "var(--foreground)";
      }
      return Story();
    },
  ],

  initialGlobals: {
    theme: "light",
  },
};

export default preview;
