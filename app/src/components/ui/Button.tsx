"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-base",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-action-bg text-action-fg border border-transparent hover:bg-action-bg-hover active:scale-[0.98]",
  secondary:
    "bg-transparent text-foreground border border-foreground hover:bg-surface-sunken active:scale-[0.98]",
  ghost:
    "bg-transparent text-foreground border border-transparent hover:text-gold-strong active:scale-[0.98]",
  gold: "bg-gold text-white border border-transparent hover:bg-gold-strong active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-body font-medium tracking-wide transition-[background-color,color,opacity,transform] duration-200 ease-standard cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
