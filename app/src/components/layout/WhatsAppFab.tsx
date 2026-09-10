import { MessageCircle } from "lucide-react";

// Fixed site-wide button, not tied to the Hero's layout — stays put regardless
// of what the Hero looks like (static grid today, maybe a rotating slide
// later) and stays visible after scrolling past it. Client's #1 first-screen
// requirement (see docs/PROJECT_SPEC.md) is satisfied by this being fixed
// on-screen from the first paint, not by living inside the Hero markup.
export function WhatsAppFab() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!whatsappNumber) return null;

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в WhatsApp"
      className="fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full bg-action-bg text-action-fg shadow-lg transition-transform duration-150 ease-standard hover:scale-105 active:scale-95"
    >
      <MessageCircle className="size-6" aria-hidden="true" />
    </a>
  );
}
