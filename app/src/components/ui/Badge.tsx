import type { ReactNode } from "react";

type Tone = "danger" | "danger-solid" | "success";

const toneClasses: Record<Tone, string> = {
  danger: "bg-danger-soft text-danger",
  // Opaque version of "danger" — the translucent tint reads fine on the
  // plain page background but nearly disappears over a product photo, since
  // a 10%-alpha fill barely dims whatever's underneath it (audit, 2026-09-10).
  // Use this instead wherever the badge sits on top of an image.
  "danger-solid": "bg-danger text-white shadow-sm",
  success: "bg-success-soft text-success",
};

export function Badge({
  tone,
  children,
}: {
  tone: Tone;
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
