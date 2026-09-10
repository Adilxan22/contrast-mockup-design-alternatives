"use client";

import { Check } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  count?: number;
}

export function Checkbox({ label, count, checked, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 font-body text-base text-foreground ${className}`}>
      <span
        className={`flex size-[18px] shrink-0 items-center justify-center rounded-sm border transition-colors duration-150 ease-standard ${
          checked ? "border-foreground bg-foreground" : "border-border bg-surface"
        }`}
      >
        {checked && <Check className="size-3 text-background" strokeWidth={3} aria-hidden="true" />}
      </span>
      <input type="checkbox" checked={checked} className="sr-only" {...props} />
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-sm text-foreground-muted">{count}</span>}
    </label>
  );
}
