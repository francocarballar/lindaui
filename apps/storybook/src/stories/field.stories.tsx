import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field } from "@lindaui/ui/field";
import { Input } from "@lindaui/ui/input";
import { Button } from "@lindaui/ui/button";

// zod 4: z.email() top-level (z.string().email() quedó deprecado)
const schema = z.object({ email: z.email("Email inválido") });

function FieldDemo() {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  return (
    <form
      onSubmit={handleSubmit(() => {})}
      className="flex flex-col gap-4 max-w-sm"
    >
      <Field control={control} name="email" label="Email" hint="Ej: usuario@ts.com">
        {({ field, invalid }) => (
          <Input
            placeholder="usuario@ts.com"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            isInvalid={invalid}
          />
        )}
      </Field>
      <Button type="submit">Enviar</Button>
    </form>
  );
}

const meta: Meta<typeof FieldDemo> = { title: "Forms/Field", component: FieldDemo };
export default meta;
type Story = StoryObj<typeof FieldDemo>;

export const Default: Story = {};
