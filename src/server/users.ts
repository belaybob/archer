import { db } from "@/lib/db";

/**
 * Finds a user by email, or creates a passwordless "shadow" account for
 * them. Used when a manager registers someone who doesn't have an Archer
 * login yet (e.g. bulk roster entry) -- they can claim the account later by
 * signing up with the same email (see note in registrations.ts) once a
 * proper account-claim flow exists. Not implemented yet: that claim flow,
 * and notifying the archer they've been registered.
 */
export async function findOrCreateUserByEmail(input: { email: string; name?: string }) {
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error(`"${input.email}" isn't a valid email address.`);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;

  return db.user.create({
    data: { email, name: input.name?.trim() || null, passwordHash: null },
  });
}
