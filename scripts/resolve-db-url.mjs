#!/usr/bin/env node
// Prints a Postgres connection string to stdout for the `prisma` CLI to use
// (a separate process from the Next.js app, so it can't call
// `getConnectionString()` itself the way src/lib/db.ts does).
//
//   DATABASE_URL already set  -> print it back unchanged (no-op passthrough,
//                                 so this script is always safe to call).
//   DATABASE_URL unset        -> ask Netlify DB for one via
//                                 `@netlify/database`'s getConnectionString().
//                                 Only works when run somewhere Netlify has
//                                 actually provisioned a database for this
//                                 environment -- the Netlify build container,
//                                 or a shell wrapped with `netlify dev:exec`.
//
// Usage: see scripts/build.sh (build-time) and README.md (local dev).
import { getConnectionString } from "@netlify/database";

if (process.env.DATABASE_URL) {
  console.log(process.env.DATABASE_URL);
  process.exit(0);
}

let url;
try {
  url = getConnectionString();
} catch (err) {
  console.error(
    "resolve-db-url: Netlify DB isn't reachable from this shell (" + err.message + ").\n" +
      "This is expected for a plain `npm run build` / `npm run dev` run outside Netlify --\n" +
      "getConnectionString() only resolves inside an actual Netlify build (e.g. a deploy triggered\n" +
      "by a git push, once this site is linked to a repo) or under `netlify dev` / `netlify build`\n" +
      "locally. For a plain local run, set DATABASE_URL yourself instead, or run this via\n" +
      "`netlify dev:exec -- npm run db:url`."
  );
  process.exit(1);
}

if (!url) {
  console.error(
    "resolve-db-url: DATABASE_URL isn't set and Netlify DB didn't return a connection string.\n" +
      "Set DATABASE_URL directly, or run this inside a Netlify build/`netlify dev:exec` context."
  );
  process.exit(1);
}
console.log(url);
