"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "contrast:age-confirmed";

export function AgeGate() {
  const [status, setStatus] = useState<"checking" | "blocked" | "denied" | "confirmed">("checking");

  useEffect(() => {
    // localStorage isn't available during SSR, so the gate must start
    // unrendered (matching server markup) and check here on mount.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(window.localStorage.getItem(STORAGE_KEY) === "1" ? "confirmed" : "blocked");
    } catch {
      // localStorage unavailable (private mode) — ask every visit rather than block outright.
      setStatus("blocked");
    }
  }, []);

  const confirm = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — the gate will just reappear next visit
    }
    setStatus("confirmed");
  };

  if (status === "checking" || status === "confirmed") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-inverse/95 px-5 backdrop-blur-sm">
      <div className="max-w-sm text-center">
        {status === "blocked" ? (
          <>
            <h2 className="mb-3 font-display text-2xl text-foreground-on-dark">Вам есть 21 год?</h2>
            <p className="mb-8 font-body text-sm text-foreground-on-dark-muted">
              Этот сайт содержит информацию о табачной продукции и предназначен только для лиц старше
              21 года.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="gold" size="lg" onClick={confirm}>
                Да, мне есть 21
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setStatus("denied")}
                className="border-foreground-on-dark text-foreground-on-dark hover:bg-white/10"
              >
                Нет
              </Button>
            </div>
          </>
        ) : (
          <p className="font-body text-foreground-on-dark-muted">
            Доступ к сайту ограничен для лиц младше 21 года.
          </p>
        )}
      </div>
    </div>
  );
}
