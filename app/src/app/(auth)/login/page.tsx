"use client";

import { useActionState } from "react";
import { loginCustomer } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginCustomer, undefined);

  return (
    <Container className="flex max-w-sm flex-col gap-5 py-20">
      <h1 className="font-display text-2xl text-foreground">Личный кабинет</h1>
      <p className="font-body text-sm text-foreground-muted">
        Код подтверждения временно не требуется — вход выполняется сразу по номеру телефона.
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <Input name="phone" type="tel" label="Номер телефона" placeholder="+7 7XX XXX XX XX" required autoFocus />
        {state?.error && <p className="font-body text-sm text-danger">{state.error}</p>}
        <Button type="submit" variant="primary" loading={pending} disabled={pending}>
          Войти
        </Button>
      </form>
    </Container>
  );
}
