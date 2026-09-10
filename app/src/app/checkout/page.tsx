import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Оформление заказа — Contrast",
};

export default function CheckoutPage() {
  return (
    <Container>
      <CheckoutClient />
    </Container>
  );
}
