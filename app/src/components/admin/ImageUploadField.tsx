"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/Input";

/**
 * A file picker that uploads immediately to /api/admin/upload (Vercel Blob)
 * and reports back the resulting public URL — plus a fallback text field for
 * pasting an existing URL directly, for cases where the image already lives
 * somewhere else (a supplier's site, a photo already uploaded elsewhere).
 * Used for both product photos and hero/promo slides so there's one upload
 * path to maintain.
 */
export function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { url: string };
      onChange(data.url);
    } catch {
      setError("Не удалось загрузить файл");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-managed URL, see project convention on imageUrl fields
          <img src={value} alt="" className="size-14 shrink-0 rounded-sm border border-border object-cover" />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-sm border border-dashed border-border text-[10px] text-foreground-muted">
            нет фото
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
            className="font-body text-xs text-foreground-secondary file:mr-3 file:rounded-sm file:border file:border-border file:bg-surface file:px-3 file:py-1.5 file:font-body file:text-xs file:text-foreground file:transition-colors file:duration-150 file:ease-standard hover:file:border-border-strong"
          />
          {uploading && <span className="font-body text-xs text-foreground-muted">Загрузка…</span>}
          {error && <span className="font-body text-xs text-danger">{error}</span>}
        </div>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="или вставь ссылку на картинку"
        className="font-body text-xs"
      />
    </div>
  );
}
