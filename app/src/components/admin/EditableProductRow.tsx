"use client";

import { useState } from "react";
import { updateProductAttributes } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function EditableProductRow({
  productId,
  categoryLabel,
  name,
  brand,
  flavor,
  strength,
  packaging,
}: {
  productId: number;
  categoryLabel: string;
  name: string;
  brand: string | null;
  flavor: string | null;
  strength: string | null;
  packaging: string | null;
}) {
  const [values, setValues] = useState({
    brand: brand ?? "",
    flavor: flavor ?? "",
    strength: strength ?? "",
    packaging: packaging ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    await updateProductAttributes(productId, values);
    setSaving(false);
    setSaved(true);
  };

  return (
    <tr className="border-b border-border">
      <td className="max-w-xs py-2 pr-4 align-top">
        <div className="text-sm text-foreground">{name}</div>
        <div className="text-xs text-foreground-muted">{categoryLabel}</div>
      </td>
      {(["brand", "flavor", "strength", "packaging"] as const).map((field) => (
        <td key={field} className="py-2 pr-2 align-top">
          <Input
            name={`${field}-${productId}`}
            value={values[field]}
            onChange={(e) => {
              setSaved(false);
              setValues((v) => ({ ...v, [field]: e.target.value }));
            }}
          />
        </td>
      ))}
      <td className="py-2 align-top">
        <Button size="sm" onClick={save} loading={saving} disabled={saving}>
          {saved ? "Сохранено" : "Сохранить"}
        </Button>
      </td>
    </tr>
  );
}
