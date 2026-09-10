import path from "node:path";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma's CLI only auto-loads a plain `.env`, but this project's env vars
// (including the ones `neon link`/`neon env pull` write) live in `.env.local`,
// matching Next.js convention — so load that explicitly before Prisma reads
// DATABASE_URL / DATABASE_URL_UNPOOLED from schema.prisma.
loadEnv({ path: path.join(__dirname, ".env.local") });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
});
