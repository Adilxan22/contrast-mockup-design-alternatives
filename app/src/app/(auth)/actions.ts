"use server";

import { redirect } from "next/navigation";
import { clearCustomerSession, createCustomerSession } from "@/lib/customer-auth";

export async function loginCustomer(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (phone.length < 6) return { error: "Введите номер телефона" };

  // Real SMS/WhatsApp OTP deferred by the client (see lib/customer-auth.ts) —
  // login succeeds immediately after a phone number is entered.
  await createCustomerSession(phone);
  redirect("/account");
}

export async function logoutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
