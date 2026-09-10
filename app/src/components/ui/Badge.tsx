import type { ReactNode } from "react";

type Tone = "neutral" | "gold" | "danger" | "danger-solid" | "success" | "dark";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-foreground-secondary",
  gold: "bg-gold-soft/25 text-gold-strong",
  danger: "bg-danger-soft text-danger",
  // Opaque version of "danger" — the translucent tint reads fine on the
  // plain page background but nearly disappears over a product photo, since
  // a 10%-alpha fill barely dims whatever's underneath it (audit, 2026-09-10).
  // Use this instead wherever the badge sits on top of an image.
  "danger-solid": "bg-danger text-white shadow-sm",
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
