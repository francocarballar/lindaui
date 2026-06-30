import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "@lindaui/ui/alert";
import { Spinner } from "@lindaui/ui/spinner";
import { Skeleton } from "@lindaui/ui/skeleton";

function FeedbackDemo() {
  return (
    <div className="flex flex-col gap-6 max-w-md">
      <Alert title="Información" description="Operación completada." />
      <Alert title="Advertencia" description="Revisa los datos." />
      <Alert title="Error" description="Algo salió mal." />
      <Spinner aria-label="Cargando" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

const meta: Meta<typeof FeedbackDemo> = { title: "Feedback/Varios", component: FeedbackDemo };
export default meta;
type Story = StoryObj<typeof FeedbackDemo>;

export const Default: Story = {};
