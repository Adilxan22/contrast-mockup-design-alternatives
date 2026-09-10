"use client";

import { Check } from "lucide-react";
import Link from "next/link";

export function ConsentCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 font-body text-sm text-foreground-secondary">
      <span
        className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-sm border transition-colors duration-150 ease-standard ${
          checked ? "border-foreground bg-foreground" : "border-border bg-surface"
        }`}
      >
        {checked && <Check className="size-3 text-background" strokeWidth={3} aria-hidden="true" />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span>
        Согласен с{" "}
        <Link href="/legal/pdn" target="_blank" className="underline hover:text-foreground">
          обработкой персональных данных
        </Link>
      </span>
    </label>
  );
}
