"use client";

import type { ButtonHTMLAttributes } from "react";

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Tag({ selected = false, className = "", children, ...props }: TagProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex shrink-0 cursor-pointer items-center rounded-full border px-4 py-2 font-body text-sm transition-colors duration-150 ease-standard ${
        selected
          ? "border-foreground bg-foreground text-foreground-on-dark"
          : "border-border bg-surface text-foreground hover:border-foreground-secondary"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
