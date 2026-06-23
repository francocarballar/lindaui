"use client";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
  type ControllerRenderProps,
} from "react-hook-form";
import type { ReactNode } from "react";

export interface FieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: (args: {
    field: ControllerRenderProps<TFieldValues, TName>;
    invalid: boolean;
  }) => ReactNode;
}

export function Field<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ control, name, label, hint, className, children }: FieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={`flex flex-col gap-2${className ? ` ${className}` : ""}`}>
          {label && (
            <label htmlFor={field.name} className="text-sm font-medium">
              {label}
            </label>
          )}
          {children({ field, invalid: fieldState.invalid })}
          {hint && !fieldState.error && (
            <small className="text-secondary text-sm">{hint}</small>
          )}
          {fieldState.error && (
            <small className="text-danger text-sm">{fieldState.error.message}</small>
          )}
        </div>
      )}
    />
  );
}
