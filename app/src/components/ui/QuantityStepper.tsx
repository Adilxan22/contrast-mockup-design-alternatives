"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-sm border border-border font-body">
      <button
        type="button"
        aria-label="Уменьшить количество"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex size-11 items-center justify-center text-foreground transition-colors duration-150 ease-standard hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="w-10 text-center text-base tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Увеличить количество"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex size-11 items-center justify-center text-foreground transition-colors duration-150 ease-standard hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
