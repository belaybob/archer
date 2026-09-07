/** Turns a display name into a URL-safe slug. Not unique on its own -- callers
 * that need uniqueness (see server/organizations.ts, server/tournaments.ts)
 * append a numeric suffix on collision. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents (combining diacritical marks)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "org";
}
