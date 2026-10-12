import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Stepper } from "@lindaui/blocks/stepper";
import { Button } from "@lindaui/ui/compound";

const meta: Meta<typeof Stepper> = {
  title: "Blocks/Stepper",
  component: Stepper,
  args: { label: "Progreso de configuración", stepLabel: "Preferencias", value: 37.5 },
  decorators: [(Story) => <div className="mx-auto max-w-md p-6"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Stepper>;

export const OnboardingProgress: Story = {};
export const CompactProgress: Story = { args: { description: "1 de 2 dispositivos vinculados", variant: "compact", value: 50 } };
export const Complete: Story = { args: { complete: true, description: "Todos los dispositivos vinculados", variant: "compact", value: 100 } };

function Steps() {
  const steps = ["Perfil", "Preferencias", "Conexiones"];
  const [index, setIndex] = useState(0);
  return <>
    <Stepper label="Progreso" stepLabel={steps[index]} value={((index + 1) / steps.length) * 100} />
    <div className="flex gap-2"><Button isDisabled={index === 0} onPress={() => setIndex(index - 1)} variant="tertiary">Anterior</Button><Button isDisabled={index === steps.length - 1} onPress={() => setIndex(index + 1)}>Siguiente</Button></div>
  </>;
}

export const ControlledSteps: Story = { render: () => <Steps /> };
