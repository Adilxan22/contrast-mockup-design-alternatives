"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => loginAdmin(formData),
    undefined
  );

  return (
    <Container className="flex max-w-sm flex-col gap-5 py-20">
      <h1 className="font-display text-2xl text-foreground">Вход в админку</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <Input name="password" type="password" label="Пароль" required autoFocus />
        {state?.error && <p className="font-body text-sm text-danger">{state.error}</p>}
        <Button type="submit" variant="primary" loading={pending} disabled={pending}>
          Войти
        </Button>
      </form>
    </Container>
  );
}
