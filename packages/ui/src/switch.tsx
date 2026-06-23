"use client";
import {
  Switch as HeroSwitch,
  SwitchContent,
  SwitchControl,
  SwitchThumb,
  type SwitchProps,
} from "@heroui/react";
import type { ReactNode } from "react";
export type { SwitchProps };

type UISwitchProps = Omit<SwitchProps, "children"> & { children?: ReactNode };

export function Switch({ children, ...props }: UISwitchProps) {
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
