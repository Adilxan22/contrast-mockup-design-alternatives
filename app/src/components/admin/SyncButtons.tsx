"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

async function trigger(url: string): Promise<string> {
  const res = await fetch(url, { method: "POST" });
  const data = await res.json();
  if (!res.ok) return `Ошибка: ${data.message ?? data.error}`;
  return JSON.stringify(data);
}

export function SyncButtons() {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState<"catalog" | "stock" | null>(null);

  const run = async (which: "catalog" | "stock") => {
    setPending(which);
    setStatus(null);
    const url = which === "catalog" ? "/api/admin/sync-catalog" : "/api/admin/sync-stock";
    setStatus(await trigger(url));
    setPending(null);
  };

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex gap-3">
        <Button onClick={() => run("catalog")} loading={pending === "catalog"} disabled={pending !== null}>
          Синхронизировать каталог
        </Button>
        <Button onClick={() => run("stock")} loading={pending === "stock"} disabled={pending !== null}>
          Синхронизировать остатки
        </Button>
      </div>
      {status && <p className="break-all font-mono text-xs text-foreground-muted">{status}</p>}
    </div>
  );
}
