"use client";
import {
  Switch as HeroSwitch,
  SwitchContent,
  SwitchControl,
  SwitchThumb,
  type SwitchProps,
} from "@heroui/react";
export type { SwitchProps };

export function Switch({ children, ...props }: SwitchProps) {
  return (
    <HeroSwitch {...props}>
      <SwitchContent>
        <SwitchControl>
          <SwitchThumb />
        </SwitchControl>
        {children}
      </SwitchContent>
    </HeroSwitch>
  );
}
