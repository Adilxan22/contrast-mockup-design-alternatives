import type { ReactNode } from "react";

type Tone = "neutral" | "gold" | "danger" | "success" | "dark";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-foreground-secondary",
  gold: "bg-gold-soft/25 text-gold-strong",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
  dark: "bg-surface-inverse text-foreground-on-dark",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-body text-xs tracking-wide ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
