#!/usr/bin/env bash
# Netlify build entry point (see package.json's "build" script and netlify.toml).
#
# Prisma owns the schema and migrations (prisma/migrations/), not Netlify DB's
# own migration system -- so the one thing this script has to do that a plain
# `next build` wouldn't is make sure the separate `prisma` CLI processes can
# see a real DATABASE_URL env var, even when the app is relying on Netlify DB
# (where the connection string normally only shows up via the JS
# `getConnectionString()` call, not a literal env var). Everything else is a
# passthrough: if DATABASE_URL is already set (any other Postgres provider),
# resolve-db-url.mjs just prints it back and nothing Netlify-specific runs.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  export DATABASE_URL="$(node scripts/resolve-db-url.mjs)"
fi

npx prisma generate
npx prisma migrate deploy
npx next build
