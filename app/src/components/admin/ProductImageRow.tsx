"use client";

import { useState } from "react";
import { setProductImage } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";

export function ProductImageRow({
  productId,
  categoryLabel,
  name,
  imageUrl,
}: {
  productId: number;
  categoryLabel: string;
  name: string;
  imageUrl: string | null;
}) {
  const [value, setValue] = useState(imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await setProductImage(productId, value);
    setSaving(false);
    setSaved(true);
  };

  return (
    <li className="flex items-start justify-between gap-4 rounded-md border border-border p-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 font-body text-sm text-foreground">{name}</div>
        <div className="mb-3 font-body text-xs text-foreground-muted">{categoryLabel}</div>
        <ImageUploadField
          value={value}
          onChange={(url) => {
            setSaved(false);
            setValue(url);
          }}
        />
      </div>
      <Button size="sm" onClick={save} loading={saving} disabled={saving} className="shrink-0">
        {saved ? "Сохранено" : "Сохранить"}
      </Button>
    </li>
  );
}
