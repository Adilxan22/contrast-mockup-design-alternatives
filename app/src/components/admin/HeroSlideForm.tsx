"use client";

import { useState } from "react";
import { createHeroSlide } from "@/app/admin/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function HeroSlideForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const formData = new FormData();
    formData.set("imageUrl", imageUrl);
    formData.set("linkUrl", linkUrl);
    const result = await createHeroSlide(formData);
    setSubmitting(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setImageUrl("");
    setLinkUrl("");
  };

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-md border border-border p-5">
      <div>
        <div className="mb-1.5 font-body text-xs tracking-wide text-foreground-secondary">Картинка</div>
        <ImageUploadField value={imageUrl} onChange={setImageUrl} />
      </div>
      <Input
        label="Куда ведёт клик"
        placeholder="/catalog?category=..."
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
      />
      {error && <p className="font-body text-sm text-danger">{error}</p>}
      <Button
        type="button"
        variant="primary"
        onClick={submit}
        loading={submitting}
        disabled={submitting || !imageUrl || !linkUrl}
      >
        Добавить слайд
      </Button>
    </div>
  );
}
