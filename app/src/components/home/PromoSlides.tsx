import Link from "next/link";
import { Container } from "@/components/ui/Container";
import type { HeroSlide } from "@prisma/client";

// Admin-managed via /admin/hero-slides (Алуа's "upload/swap ad images" request).
// Plain <img>, not next/image: these are arbitrary admin-pasted URLs, and
// gating every possible source domain through next.config.ts's remotePatterns
// would mean a developer has to intervene each time she adds a new one.
export function PromoSlides({ slides }: { slides: HeroSlide[] }) {
  if (slides.length === 0) return null;

  return (
    <Container className="pb-10 lg:pb-16">
      <div className={`grid gap-3 ${slides.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {slides.map((slide) => (
          <Link
            key={slide.id}
            href={slide.linkUrl}
            className="group block overflow-hidden rounded-md border border-border bg-surface-sunken"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- see file doc comment */}
            <img
              src={slide.imageUrl}
              alt=""
              className="aspect-[21/9] w-full object-cover transition-transform duration-300 ease-standard group-hover:scale-[1.02]"
            />
          </Link>
        ))}
      </div>
    </Container>
  );
}
