"use server";

import { redirect } from "next/navigation";
import { clearCustomerSession, createCustomerSession, otpProvider } from "@/lib/customer-auth";

export async function loginCustomer(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (phone.length < 6) return { error: "Введите номер телефона" };

  // otpProvider is DevNoOpOtpProvider for now (real SMS/WhatsApp OTP deferred —
  // see lib/customer-auth.ts) — send() is a no-op, login succeeds immediately.
  await otpProvider.send(phone);
  await createCustomerSession(phone);
  redirect("/account");
}

export async function logoutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
