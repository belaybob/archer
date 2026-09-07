import { PrismaClient } from "@prisma/client";

// Standard Next.js-safe Prisma singleton so hot-reload in dev doesn't open a
// new connection pool per reload.
//
// Database URL resolution: if DATABASE_URL is set (any Postgres -- Supabase,
// RDS, a local instance, whatever), we use it as-is and never touch Netlify
// DB at all -- that's what keeps the provider swappable. Only when it's
// *unset* do we fall back to Netlify DB's own resolution
// (`getConnectionString()`), which is how Netlify says to consume it: no
// connection string to configure by hand, it "just works" once
// `@netlify/database` is installed and the app is running under `netlify
// dev` or a Netlify deploy. See prisma/README.md for how this fallback is
// kept out of the picture entirely for `prisma` CLI commands (which don't
// go through this file).
function resolveDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    // Lazy require so a non-Netlify deployment (DATABASE_URL always set)
    // never needs this package to even resolve, let alone run.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getConnectionString } = require("@netlify/database");
    return getConnectionString();
  } catch {
    return undefined;
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(
    process.env.DATABASE_URL ? undefined : { datasources: { db: { url: resolveDatabaseUrl() } } }
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
