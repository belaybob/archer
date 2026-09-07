# Server layer

Framework-agnostic business logic lives here as plain TypeScript functions.
Next.js Server Actions (`src/app/actions/**`) and route handlers stay thin
and call into these -- that's what lets the app move off Next.js or off
Netlify without rewriting the actual logic.

## Implemented

- `auth.ts` — password hashing (bcrypt), signup/login, DB-backed session
  create/lookup/delete. No dependency on a Netlify-specific identity product.
- `users.ts` — `findOrCreateUserByEmail`, used when a manager registers
  someone who doesn't have an Archer account yet (creates a passwordless
  "shadow" account; there's no account-claim flow yet for them to set a
  password and log in later).
- `organizations.ts` — create an organization (creator becomes `OWNER`),
  list a user's organizations, `getMembership` (non-throwing, for branching
  UI) and `requireMembership` (throws, for guarding writes).
- `format-templates.ts` — list built-in + an org's own format templates;
  `cloneFormatTemplate` to copy a built-in into an org's editable library
  (not wired into any UI yet).
- `tournaments.ts` — create a tournament with one stage + divisions; list an
  org's tournaments, list public tournaments (for browsing/registration),
  fetch a tournament's full detail, update its status.
- `registrations.ts` — `registerSelf` (archer, requires `REGISTRATION_OPEN`),
  `registerByManager` (single archer by email, organizer-only, allowed any
  time short of cancelled/completed), `registerTeamRoster` (bulk roster from
  a list of archers, skips rather than fails on individual bad rows),
  `updateRegistrationStatus`, capacity-driven auto-waitlisting, and listing
  helpers (`listRegistrationsForTournament`, `listRegistrationsForArcher`,
  `listMyRegistrationsForTournament`, `listSeedableRegistrations`).
- `scoring.ts` — `recordEnd` (per-end arrow scores, upserts), `getStageStandings`
  (cumulative totals per registration, grouped for display by division),
  `getScoreEntriesForRegistration`. Covers `CUMULATIVE_SCORE` stages.
- `brackets.ts` — `buildEliminationBracket` (seeded single-elimination,
  standard seeding order, automatic bye resolution incl. cascaded byes),
  `getBracket`, `recordMatchSets` (World-Archery-style 2/1/0 set scoring,
  automatic winner advancement to the next round), `resolveTiedMatch`
  (manual shoot-off winner, since arrow position isn't tracked). A bracket
  is scoped to one (stage, division) pair — see the Match model's doc
  comment in `prisma/schema.prisma` for the roundNumber/slot convention
  that makes advancement deterministic.

## Not yet implemented

- `storage.ts` — a small interface for file uploads (results PDFs, photos)
  so the actual provider (Netlify Blobs, S3-compatible storage, etc.) is an
  implementation detail behind it.
- `handicaps.ts` — score-to-handicap lookups and season classification
  tracking for league play, using the `HandicapRecord` model. `scoring.ts`
  computes raw cumulative totals only; handicap conversion is real-world
  organization-specific (Archery GB tables differ from others) and is
  scoped as its own later phase rather than approximated here.
- Multi-stage tournament setup (e.g. a ranking round feeding an elimination
  bracket) — the schema supports multiple `TournamentStage` rows per
  tournament and `buildEliminationBracket` can be seeded from any ordered
  list, but `createTournament` currently only builds one stage, and bracket
  seeding defaults to registration order rather than a prior stage's
  standings.
- An account-claim flow for the passwordless "shadow" accounts `users.ts`
  creates for manager-registered archers, and any notification that someone
  was registered on their behalf.
