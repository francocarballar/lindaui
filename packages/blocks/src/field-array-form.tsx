"use client";
import { type ReactNode } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@lindaui/ui/button";
import { Input } from "@lindaui/ui/input";
import { Select } from "@lindaui/ui/select";

export interface FieldArrayFormValues {
  category: string;
  name: string;
  entries: { key: string; value: string }[];
}

export interface FieldArrayFormProps {
  onSubmit: (values: FieldArrayFormValues) => void | Promise<void>;
  options: { value: string; label: string }[];
  categoryLabel?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  entriesLabel?: string;
  addLabel?: string;
  removeLabel?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  emptyHint?: ReactNode;
  submitLabel?: string;
  loading?: boolean;
  defaultValues?: Partial<FieldArrayFormValues>;
}

export function FieldArrayForm({
  onSubmit,
  options,
  categoryLabel = "Categoría",
  nameLabel = "Nombre",
  namePlaceholder,
  entriesLabel = "Entradas",
  addLabel = "Agregar entrada",
  removeLabel = "Eliminar entrada",
  keyPlaceholder = "Clave",
  valuePlaceholder = "Valor",
  emptyHint,
  submitLabel = "Guardar",
  loading = false,
  defaultValues,
}: FieldArrayFormProps) {
  const { control, handleSubmit } = useForm<FieldArrayFormValues>({
    defaultValues: {
      category: defaultValues?.category ?? options[0]?.value ?? "",
      name: defaultValues?.name ?? "",
      entries: defaultValues?.entries ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
        {/* Category Select via Controller */}
        <div>
          <label className="text-sm font-medium">{categoryLabel}</label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                items={options}
                value={field.value}
                onChange={(val) => field.onChange(val)}
              />
            )}
          />
        </div>

        {/* Name Input via Controller */}
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label={nameLabel}
              placeholder={namePlaceholder}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />

        {/* Entries section */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{entriesLabel}</p>

          {fields.length === 0 && emptyHint && (
            <div className="text-sm text-muted-foreground">{emptyHint}</div>
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <Controller
                control={control}
                name={`entries.${index}.key`}
                render={({ field: f }) => (
                  <div className="min-w-0 w-full">
                    <Input
                      placeholder={keyPlaceholder}
                      aria-label={`${keyPlaceholder} ${index + 1}`}
                      value={f.value}
                      onChange={f.onChange}
                      onBlur={f.onBlur}
                      name={f.name}
                      fullWidth
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name={`entries.${index}.value`}
                render={({ field: f }) => (
                  <div className="min-w-0 w-full">
                    <Input
                      placeholder={valuePlaceholder}
                      aria-label={`${valuePlaceholder} ${index + 1}`}
                      value={f.value}
                      onChange={f.onChange}
                      onBlur={f.onBlur}
                      name={f.name}
                      fullWidth
                    />
                  </div>
                )}
              />
              <Button
                variant="ghost"
                onPress={() => remove(index)}
                aria-label={removeLabel}
                className="w-full sm:w-auto"
              >
                <X size={16} />
              </Button>
            </div>
          ))}

          <Button
            variant="secondary"
            onPress={() => append({ key: "", value: "" })}
          >
            <Plus size={16} />
            {addLabel}
          </Button>
        </div>

        <Button type="submit" isDisabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
