"use client";
import {
  Checkbox as HeroCheckbox,
  CheckboxContent,
  CheckboxControl,
  CheckboxIndicator,
  type CheckboxProps,
} from "@heroui/react";
export type { CheckboxProps };

/**
 * HeroUI v3 splits the checkbox into a field root + interactive button
 * (Content) + Control/Indicator. This wrapper composes them so callers use
 * the flat `<Checkbox>label</Checkbox>` form with a working role=checkbox.
 */
export function Checkbox({ children, ...props }: CheckboxProps) {
  return (
    <HeroCheckbox {...props}>
      <CheckboxContent>
        <CheckboxControl>
          <CheckboxIndicator />
        </CheckboxControl>
        {children}
      </CheckboxContent>
    </HeroCheckbox>
  );
}
