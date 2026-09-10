import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных — Contrast",
};

export default function PdnConsentPage() {
  return (
    <Container className="max-w-2xl py-10">
      <h1 className="mb-6 font-display text-3xl text-foreground">
        Согласие на обработку персональных данных
      </h1>
      <div className="space-y-4 font-body text-base leading-relaxed text-foreground-secondary">
        <p>
          Оформляя заказ на сайте Contrast, вы даёте согласие на обработку ваших персональных
          данных (имя, номер телефона, адрес доставки) в соответствии с Законом Республики
          Казахстан «О персональных данных и их защите».
        </p>
        <p>
          Данные используются исключительно для оформления и доставки заказа, связи с вами по
          вопросам заказа и начисления бонусов программы лояльности. Данные не передаются третьим
          лицам, за исключением служб доставки, необходимых для выполнения заказа.
        </p>
        <p>
          Вы можете отозвать согласие в любой момент, обратившись по контактам, указанным на
          сайте.
        </p>
      </div>
    </Container>
  );
}
