import type { Metadata } from "next";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AgeGate } from "@/components/layout/AgeGate";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartProvider } from "@/lib/cart-context";
import { getCustomerSession } from "@/lib/customer-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contrast — Premium Hookah Shop",
  description:
    "Кальяны, табак, бестабачные смеси и аксессуары для тех, кто ценит вкус, качество и атмосферу. Astana.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getCustomerSession();

  return (
    <html lang="ru" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-body">
        <AgeGate />
        <CartProvider>
          <Header isLoggedIn={Boolean(session)} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
