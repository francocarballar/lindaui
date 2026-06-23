"use client";
// HeroUI v3 date entry is a RAC composition (DateField + Group + segments).
// Re-exported as the compound component so consumers get the full, correct
// composable API (DateInput.Group, DateInput.Input, DateInput.Segment, ...).
export { DateField as DateInput, type DateFieldProps as DateInputProps } from "@heroui/react";
