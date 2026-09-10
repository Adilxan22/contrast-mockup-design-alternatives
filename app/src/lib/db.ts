import { PrismaClient } from "@prisma/client";

// Standard Next.js dev hot-reload pattern: without caching on globalThis, every
// module reload would open a fresh pool of DB connections until they're exhausted.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
