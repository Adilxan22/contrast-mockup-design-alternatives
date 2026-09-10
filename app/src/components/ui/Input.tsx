"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
}

export function Input({ label, icon, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <label htmlFor={inputId} className="flex flex-col gap-1.5 font-body">
      {label && (
        <span className="text-xs tracking-wide text-foreground-secondary">{label}</span>
      )}
      <div className="flex h-11 items-center gap-2 rounded-sm border border-border bg-surface px-3 transition-colors duration-150 ease-standard focus-within:border-focus-ring">
        {icon && (
          <span className="flex text-foreground-muted" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full min-w-0 border-none bg-transparent text-base text-foreground outline-none placeholder:text-foreground-muted ${className}`}
          {...props}
        />
      </div>
    </label>
  );
}
