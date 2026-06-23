"use client";
import {
  Radio as HeroRadio,
  RadioContent,
  RadioControl,
  RadioIndicator,
  type RadioProps,
} from "@heroui/react";
export type { RadioProps };

export function Radio({ children, ...props }: RadioProps) {
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
