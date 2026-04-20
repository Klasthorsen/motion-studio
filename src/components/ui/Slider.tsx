"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export function Slider({ label, value, onChange, min, max, step = 1, unit = "" }: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-foreground">
          {value}
          {unit}
        </span>
      </div>
      <SliderPrimitive.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      >
        <SliderPrimitive.Track className="bg-[var(--slider-track)] relative grow rounded-full h-1.5">
          <SliderPrimitive.Range className="absolute bg-accent rounded-full h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block w-4 h-4 bg-[var(--slider-thumb)] rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Root>
    </div>
  );
}
