"use client";

import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export function Select({ label, options, id, className = "", ...props }: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <label htmlFor={selectId} className="flex flex-col gap-1.5 font-body">
      {label && (
        <span className="text-xs tracking-wide text-foreground-secondary">{label}</span>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`h-11 w-full appearance-none rounded-sm border border-border bg-surface px-3 pr-9 text-base text-foreground outline-none transition-colors duration-150 ease-standard focus:border-focus-ring ${className}`}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
          aria-hidden="true"
        />
      </div>
    </label>
  );
}
