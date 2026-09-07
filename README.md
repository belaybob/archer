# Archer

A multi-tenant platform for registering and managing archery tournaments and competitions — plus the public marketing site that lists them.

## Why it's built this way

Archery tournaments come in genuinely different shapes: a World-Archery-style ranking round feeding a head-to-head elimination bracket, a field or 3D course walked in squads at marked/unmarked distances, or a club league scored on a rolling handicap. Rather than hard-coding one of these, the app treats a tournament's **format as configuration** (distances, arrow counts, target faces, scoring method) attached to a `FormatTemplate`, with a small built-in library of presets to start from. See `/prisma/schema.prisma` for the full model and `docs/tournament-formats.md` (or the Archer project doc, if you're reading this from the chat) for the research behind it.

## Stack, and why it's swappable

Deploying to **Netlify** first, but nothing here is Netlify-specific on purpose:

- **Next.js** for both the marketing site and the app. Netlify has first-class Next.js support, but Next.js itself runs anywhere (Vercel, a plain Node server, self-hosted).
- **Business logic lives in `src/server/`** as plain TypeScript functions that route handlers call into — not written directly against a serverless-function API — so it isn't tied to Netlify Functions specifically.
- **Prisma + PostgreSQL** for data. Prisma works identically against Netlify DB (Neon), Supabase, RDS, or a local Postgres — swapping providers is a connection string change, not a rewrite.
- **Auth** uses a database-backed session approach (see `src/server/auth.ts`) rather than a host-specific identity product.
- **File storage** goes behind `src/server/storage.ts` so the actual provider is an implementation detail.

## Getting started

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, etc. -- see "Local database" below
npx prisma migrate dev    # create the database schema (auto-runs the seed below)
npm run dev
```

`prisma migrate dev` runs the seed script automatically the first time. If you ever need to
(re-)load the built-in format presets by hand: `npm run prisma:seed`.

Then: visit `/signup` to create an account, which takes you straight into creating an
organization and then your first tournament from one of the built-in format presets.

### Local database: Netlify DB

This project is linked to the **archer-tournaments** Netlify site and uses
[Netlify DB](https://docs.netlify.com/build/data-and-storage/netlify-database/) (Postgres, Neon
under the hood) -- no database to provision by hand. `@netlify/database` is already a dependency
and `src/lib/db.ts` falls back to it automatically whenever `DATABASE_URL` isn't set, so the app
itself needs zero Netlify-specific configuration.

The one thing that *does* need a real `DATABASE_URL` env var is the `prisma` CLI, since it's a
separate process that can't call Netlify's `getConnectionString()` API itself. One-time setup for
local dev:

```bash
netlify link              # connect this folder to the archer-tournaments site, if not done already
netlify dev:exec -- npm run db:url    # prints the connection string for your local dev DB branch
```

Paste that into `.env` as `DATABASE_URL`, then `npx prisma migrate dev` as above works normally.
Run the app itself with `netlify dev` (instead of `npm run dev`) so Netlify Dev provisions/attaches
the local database branch -- `src/lib/db.ts`'s fallback picks it up automatically from there, no
`DATABASE_URL` needed for the app process, only for `prisma` commands.

Prisma's migrations (`prisma/migrations/`) stay the single source of truth for the schema --
this project deliberately doesn't use Netlify DB's own migration system
(`netlify/database/migrations/`, left absent on purpose). `getConnectionString()` is the *only*
Netlify DB API this codebase touches, and only as a fallback behind a plain `DATABASE_URL` check --
swap in Supabase, RDS, or local Postgres at any time by just setting `DATABASE_URL` and Netlify DB
stops being consulted at all (see `scripts/resolve-db-url.mjs`, used by `scripts/build.sh` for the
same fallback at deploy time).

## Project layout

```
prisma/schema.prisma        Data model (orgs, tournaments, formats, registrations, brackets, ...)
prisma/seed.ts              Loads the built-in format presets as global FormatTemplate rows
src/app/                    Next.js app router: marketing pages + the authenticated app
src/app/actions/            Server Actions (Next-specific glue: cookies, redirects) that call src/server/
src/app/app/                Authenticated app: dashboard, org/tournament setup, registration, scoring, brackets
src/lib/tournament-formats.ts   Built-in format presets derived from the format research
src/lib/current-user.ts     Reads the session cookie -> current user, for Server Components
src/server/                 Framework-agnostic business logic: auth, orgs, tournaments, registrations, scoring, brackets
netlify.toml                Netlify build/deploy config
```

## What's built so far

- **Auth**: email/password signup and login, bcrypt-hashed passwords, DB-backed sessions
  (`Session` table + an httpOnly cookie) rather than a host-specific identity product.
- **Organizations**: creating one makes you its `OWNER`; the schema supports `ADMIN` and
  `MANAGER` roles too (member-invite UI isn't built yet).
- **Format template library**: the presets in `src/lib/tournament-formats.ts` are seeded into
  the DB as global templates; `listAvailableFormatTemplates` returns those plus any an org has
  cloned for itself (cloning has a service function but no UI yet).
- **Tournament setup**: create a tournament under an organization, picking a format preset,
  a scoring method (cumulative / set-system / handicap-adjusted), and a comma-separated list of
  divisions. Creates one `TournamentStage` — multi-stage tournaments (e.g. ranking round feeding
  an elimination bracket) are modeled in the schema but the UI to chain stages isn't built yet.
- **Registration**: an archer can browse published tournaments and self-register into a division
  while registration is open. Organizers can add a single registrant by email (an account is
  created for them if they don't have one) or register a whole roster/team at once from a
  pasted list, any time the tournament isn't cancelled/completed. Registration status
  (pending/confirmed/waitlisted/withdrawn/checked-in) is editable from the organizer's
  registrations page; a tournament with a `capacity` set automatically waitlists new
  registrations once it's full.
- **Scoring**: organizers record per-end arrow scores against any registration in a stage;
  cumulative standings (grouped by division) are computed live from recorded ends. Works for
  any `CUMULATIVE_SCORE` stage (target ranking rounds, field, 3D, indoor).
- **Brackets**: for a `SET_SYSTEM` stage, an organizer builds a single-elimination bracket per
  division (seeded by registration order by default), with byes resolved automatically. Match
  scores are entered as a full set-by-set result (e.g. `28-26, 27-27, 25-29`) using the
  World-Archery-style 2/1/0 match-point system; winners advance automatically. A tied match
  (e.g. 5-5 after a best-of-5) needs a manual shoot-off winner declared, since arrow-position
  ("closest to center") isn't tracked by this schema.

## What's not built yet

The real marketing-site design, payments, and league/handicap tracking (converting scores to a
handicap and tracking season standings). See the Archer project plan doc for the full roadmap.

## Known scaffold caveats

- No input validation library is wired in yet (forms do basic manual checks) — worth adding
  something like Zod before this goes further.
- Server Action error handling is minimal: a thrown error becomes Next.js's default error UI
  rather than an inline form error. Fine for local development, worth improving before real users
  hit signup/login/registration.
- Match score entry is "enter the whole match's sets at once", not a live in-progress set-by-set
  tracker — fine for entering a final result, less good for scoring courtside in real time.
- Bracket seeding defaults to registration order. Seeding from a prior ranking-round stage's
  standings needs multi-stage tournament setup (see below) to be wired up first.
- Multi-stage tournament setup (e.g. a ranking round feeding an elimination bracket as two
  linked stages) isn't in the UI yet, even though the schema supports it — `createTournament`
  currently only builds one stage per tournament.
- This was scaffolded in a sandboxed environment that couldn't reach Prisma's binary CDN, so
  `prisma generate`/`migrate` haven't actually been run against a live database yet — do that
  first thing after pulling this down. (I did run a full `npm install` + `tsc --noEmit` against
  the pre-generate client stub to structurally check everything else; the only errors it
  produced were the expected "missing generated types" ones from that stub, not real bugs.)
