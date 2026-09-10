import type { ReactNode } from "react";

// Visible on-hover label for icon-only controls — the aria-label on the
// control itself covers screen readers, this covers sighted mouse/keyboard
// users who have no other way to tell what an icon-only button does
// (UI/UX audit, 2026-09-10). group-focus-within so it also shows on
// keyboard Tab focus, not just mouse hover.
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 rounded-sm bg-ink-900 px-2 py-1 font-body text-xs whitespace-nowrap text-foreground-on-dark opacity-0 transition-opacity duration-150 ease-standard group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
