import "server-only";
import { hasDatabase, prisma } from "./db";
import type { HeroSlide } from "@prisma/client";

export async function getActiveHeroSlides(): Promise<HeroSlide[]> {
  if (!hasDatabase) return [];
  try {
    return await prisma.heroSlide.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[hero-slides] DB read failed:", err);
    return [];
  }
}
