"use client";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@lindaui/ui/card";
import { Input } from "@lindaui/ui/input";
import { Button } from "@lindaui/ui/button";
import { Field } from "@lindaui/ui/field";
import { Text } from "@lindaui/ui/text";

// Block: login compuesto de primitivos @lindaui/ui (field + input + button). Maneja
// el form con react-hook-form internamente; el consumidor solo recibe los
// valores en onSubmit. API propia, no filtra tipos de HeroUI.
//
// `bare`: sin Card ni título — campos apilados + botón full-width. Para usar
// dentro de un shell que ya aporta el heading/contenedor (ej. <AuthLayout/>).
export interface LoginValues {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (values: LoginValues) => void | Promise<void>;
  title?: string;
  emailLabel?: string;
  passwordLabel?: string;
  submitLabel?: string;
  loading?: boolean;
  error?: string;
  className?: string;
  /** Sin Card ni título (para componer dentro de AuthLayout u otro shell). */
  bare?: boolean;
}

export function LoginForm({
  onSubmit,
  title = "Iniciar sesión",
  emailLabel = "Email",
  passwordLabel = "Contraseña",
  submitLabel = "Ingresar",
  loading = false,
  error,
  className,
  bare = false,
}: LoginFormProps) {
  const { control, handleSubmit } = useForm<LoginValues>({
    defaultValues: { email: "", password: "" },
  });

  const fields = (
    <>
      <Field control={control} name="email">
        {({ field, invalid }) => (
          <Input
            label={emailLabel}
            type="email"
            autoComplete="username"
            value={field.value}
            onChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
            name={field.name}
            isInvalid={invalid}
          />
        )}
      </Field>
      <Field control={control} name="password">
        {({ field, invalid }) => (
          <Input
            label={passwordLabel}
            type="password"
            autoComplete="current-password"
            value={field.value}
            onChange={(value) => field.onChange(value)}
            onBlur={field.onBlur}
            name={field.name}
            isInvalid={invalid}
          />
        )}
      </Field>
      {error && (
        <Text role="alert" className="text-sm text-[var(--danger,#dc2626)]">
          {error}
        </Text>
      )}
    </>
  );

  if (bare) {
    return (
      <form
        onSubmit={handleSubmit((values) => onSubmit(values))}
        noValidate
        className={`space-y-5 ${className ?? ""}`.trim()}
      >
        <div className="flex flex-col gap-5">{fields}</div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isDisabled={loading}
          className="w-full"
        >
          {submitLabel}
        </Button>
      </form>
    );
  }

  return (
    <Card className={`w-full max-w-sm ${className ?? ""}`.trim()}>
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
        <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit((values) => onSubmit(values))} noValidate>
        <CardContent className="flex flex-col gap-4 px-4 sm:px-6">{fields}</CardContent>
        <CardFooter className="px-4 pb-4 sm:px-6 sm:pb-5">
          <Button type="submit" variant="primary" isDisabled={loading} className="w-full">
            {submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
