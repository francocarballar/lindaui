"use client";
import {
  Slider as HeroSlider,
  SliderTrack,
  SliderFill,
  SliderThumb,
  type SliderProps,
} from "@heroui/react";
export type { SliderProps };

export function Slider({ children, ...props }: SliderProps) {
  // When callers provide their own composition, respect it; otherwise render
  // the default track/fill/thumb so the slider is functional out of the box.
  return (
    <HeroSlider {...props}>
      {children ?? (
        <SliderTrack>
          <SliderFill />
          <SliderThumb />
        </SliderTrack>
      )}
    </HeroSlider>
  );
}
