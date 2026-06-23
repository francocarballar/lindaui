"use client";
import {
  Radio as HeroRadio,
  RadioContent,
  RadioControl,
  RadioIndicator,
  type RadioProps,
} from "@heroui/react";
import type { ReactNode } from "react";
export type { RadioProps };

type UIRadioProps = Omit<RadioProps, "children"> & { children?: ReactNode };

export function Radio({ children, ...props }: UIRadioProps) {
  return (
    <HeroRadio {...props}>
      <RadioContent>
        <RadioControl>
          <RadioIndicator />
        </RadioControl>
        {children}
      </RadioContent>
    </HeroRadio>
  );
}
